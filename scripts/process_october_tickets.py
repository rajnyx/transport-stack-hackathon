"""scripts/process_october_tickets.py
High-Performance Organizer Ticket Ingestion & Passenger Load Reconstruction Pipeline.
Processes all 2.56 million October 2026 ETM records, performs vectorized token-constrained
stop sequence mapping, calculates mass-conservation running passenger loads, and populates
fact_zone_demand with data_tier='organizer'.
"""
import os
import sys
import time
import re
import logging
from collections import defaultdict
from typing import Dict, List, Tuple, Set, Any, Optional

import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import Session

# Setup python path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
for p in [backend_dir, root_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.models.transit import get_engine, DimRoute, DimRoutePattern, RelPatternStop, DimStop
from app.models.demand import Base, SysRuntimeMetadata, FactZoneDemand

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("process_tickets")


def clean_tokens(s: str) -> set:
    """Extracts informative phonetic tokens from stop names."""
    if not s or not isinstance(s, str):
        return set()
    s = s.lower().replace("s.j.", "safdarjung").replace("sj ", "safdarjung ").strip()
    s = re.sub(r'\b(terminal|metro station|crossing|bus stand|stand|dtc|\(t\)|flats|dda flats|village|more|road|rd)\b', '', s)
    return set(re.findall(r'[a-z0-9]+', s))


stop_resolution_cache: Dict[Tuple[str, str], Optional[int]] = {}
pattern_exact_maps: Dict[str, Dict[str, int]] = {}


def resolve_stop_seq(stop_name: str, pid: str, pattern_stops: List[Tuple[int, int, str, set]]) -> Optional[int]:
    """Resolves a stop name to a stop sequence along a specific pattern with O(1) caching."""
    if not stop_name:
        return None
    s_clean = str(stop_name).strip()
    cache_key = (s_clean, pid)
    if cache_key in stop_resolution_cache:
        return stop_resolution_cache[cache_key]

    s_lower = s_clean.lower()
    exact_map = pattern_exact_maps.get(pid)
    if exact_map is not None:
        if s_lower in exact_map:
            res = exact_map[s_lower]
            stop_resolution_cache[cache_key] = res
            return res
        c_s = re.sub(r'[^A-Z0-9]', '', s_clean.upper())
        if c_s in exact_map:
            res = exact_map[c_s]
            stop_resolution_cache[cache_key] = res
            return res
        if len(c_s) > 6 and c_s[:6] in exact_map:
            res = exact_map[c_s[:6]]
            stop_resolution_cache[cache_key] = res
            return res

    # Token overlap match
    q_tokens = clean_tokens(s_clean)
    if q_tokens:
        best_seq = None
        best_overlap = 0
        for seq, zone, name, tokens in pattern_stops:
            overlap = len(q_tokens & tokens)
            if overlap > best_overlap:
                best_overlap = overlap
                best_seq = seq
        if best_overlap > 0:
            stop_resolution_cache[cache_key] = best_seq
            return best_seq

    stop_resolution_cache[cache_key] = None
    return None


def parse_ticket_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    """Robustly parses ticket timestamps in df['created_at'] preserving IST (+05:30).

    Uses pd.to_datetime(format='mixed') with compatibility and error checks.
    Extracts:
      - df['hour']: int (0-23) in IST
      - df['trip_date']: str (YYYY-MM-DD) in IST
      - df['day_type']: 'WEEKDAY', 'SATURDAY', or 'SUNDAY'

    Raises:
      RuntimeError: If pandas does not support format='mixed'.
      ValueError: If any invalid or corrupt timestamps are encountered.
    """
    # 1. Check Pandas compatibility for format="mixed" (requires pandas >= 2.0.0)
    try:
        _ = pd.to_datetime(["2026-10-01 10:00:00+05:30"], format="mixed")
    except (TypeError, ValueError) as err:
        msg = (
            f"Installed Pandas version ({pd.__version__}) does not support format='mixed' in pd.to_datetime(). "
            "Pandas >= 2.0.0 is required for robust mixed-format timestamp parsing."
        )
        logger.critical(msg)
        raise RuntimeError(msg) from err

    # 2. Robust ISO timestamp parsing with format="mixed", preserving IST (+05:30)
    created_at_dt = pd.to_datetime(df["created_at"], format="mixed", errors="coerce")

    # 3. Detect, count, and log invalid timestamps
    invalid_mask = created_at_dt.isna()
    invalid_count = int(invalid_mask.sum())
    if invalid_count > 0:
        logger.error(f"Found {invalid_count} invalid timestamp(s) in 'created_at'.")
        raise ValueError(
            f"Found {invalid_count} invalid timestamp(s) in 'created_at'. "
            "Processing stopped to prevent generating incorrect results."
        )
    logger.info(f"Successfully validated {len(created_at_dt):,} timestamps (0 invalid).")

    # 4. Preserve original IST timezone (+05:30) if timezone-aware
    if created_at_dt.dt.tz is not None:
        created_at_dt = created_at_dt.dt.tz_convert("+05:30")

    # 5. Extract hour, trip_date, and day_type
    df["hour"] = created_at_dt.dt.hour.astype(int)
    df["trip_date"] = created_at_dt.dt.strftime("%Y-%m-%d")
    dow = created_at_dt.dt.dayofweek
    df["day_type"] = np.where(dow == 6, "SUNDAY", np.where(dow == 5, "SATURDAY", "WEEKDAY"))
    return df


def run_pipeline(csv_path: str, db_url: str):
    logger.info("==================================================================")
    logger.info("  STARTING CROWDWISE OCTOBER 2026 TICKETING RECONSTRUCTION        ")
    logger.info("==================================================================")
    t_start = time.time()
    
    # 1. Connect to Database & Load Transit Route Patterns
    logger.info("[1/6] Loading GTFS Transit Route Patterns and Stop Sequences from DB...")
    engine = create_engine(db_url)
    
    with Session(engine) as session:
        # Load route pattern map
        stmt = (
            select(
                DimRoutePattern.pattern_id,
                DimRoutePattern.route_id,
                DimRoutePattern.direction_id,
                DimRoute.route_short_name,
            )
            .outerjoin(DimRoute, DimRoutePattern.route_id == DimRoute.route_id)
        )
        pattern_rows = session.execute(stmt).all()
        
        # Build route_name -> primary pattern_id
        route_to_pattern: Dict[str, str] = {}
        for p_id, r_id, d_id, r_short in pattern_rows:
            p_str = str(p_id)
            if r_short:
                s_name = str(r_short).strip().upper()
                if s_name not in route_to_pattern:
                    route_to_pattern[s_name] = p_str
                # Base without UP/DOWN
                base = s_name.replace("UP", "").replace("DOWN", "").replace("DN", "").strip()
                if base not in route_to_pattern:
                    route_to_pattern[base] = p_str
            if str(r_id) not in route_to_pattern:
                route_to_pattern[str(r_id)] = p_str

        # Load ordered stops per pattern
        pat_stops_stmt = (
            select(
                RelPatternStop.pattern_id,
                RelPatternStop.stop_sequence,
                RelPatternStop.zone_id,
                DimStop.stop_name,
            )
            .outerjoin(DimStop, RelPatternStop.stop_id == DimStop.stop_id)
            .order_by(RelPatternStop.pattern_id, RelPatternStop.stop_sequence)
        )
        pat_stops_rows = session.execute(pat_stops_stmt).all()
        
        pattern_stops_map: Dict[str, List[Tuple[int, int, str, set]]] = defaultdict(list)
        for pid, seq, zone, sname in pat_stops_rows:
            p_str = str(pid)
            sname_str = str(sname or "").strip()
            tokens = clean_tokens(sname_str)
            pattern_stops_map[p_str].append((int(seq), int(zone), sname_str, tokens))
            if p_str not in pattern_exact_maps:
                pattern_exact_maps[p_str] = {}
            pattern_exact_maps[p_str][sname_str.lower()] = int(seq)
            c = re.sub(r'[^A-Z0-9]', '', sname_str.upper())
            pattern_exact_maps[p_str][c] = int(seq)
            if len(c) > 6:
                pattern_exact_maps[p_str][c[:6]] = int(seq)

    logger.info(f"Loaded {len(route_to_pattern)} route mappings and {len(pattern_stops_map)} pattern stop sequences.")

    # 2. Fast Streaming & Vectorized Ingestion of 2.56M Tickets
    logger.info(f"[2/6] Ingesting and vectorizing {csv_path}...")
    t0 = time.time()
    
    usecols = ["route", "start_stop_name", "end_stop_name", "passenger_count", "created_at"]
    df = pd.read_csv(csv_path, usecols=usecols)
    logger.info(f"Loaded {len(df):,} raw ticket rows in {time.time()-t0:.2f}s.")

    # Robust ISO timestamp parsing via pd.to_datetime(format="mixed"), preserving IST (+05:30)
    df = parse_ticket_timestamps(df)
    
    df["route_clean"] = df["route"].astype(str).str.strip().str.upper()
    df["direction_id"] = np.where(df["route_clean"].str.contains("DOWN|DN"), 1, 0)
    df["passenger_count"] = df["passenger_count"].fillna(1).astype(int)

    # 3. Vectorized Aggregation of O-D Flows
    logger.info("[3/6] Performing vectorized O-D flow aggregation across routes, dates, and hours...")
    t1 = time.time()
    agg = df.groupby(
        ["route_clean", "direction_id", "day_type", "trip_date", "hour", "start_stop_name", "end_stop_name"],
        as_index=False,
    )["passenger_count"].sum()
    logger.info(f"Aggregated {len(df):,} tickets into {len(agg):,} distinct hourly corridor O-D flows in {time.time()-t1:.2f}s.")

    # 4. Mass-Conservation Passenger Load Reconstruction
    logger.info("[4/6] Reconstructing segment passenger loads with Pink Pass expansion factor (gamma=1.30)...")
    t2 = time.time()
    
    corridor_groups = agg.groupby(["route_clean", "direction_id", "day_type", "trip_date", "hour"])
    
    zone_facts: List[Dict[str, Any]] = []
    routes_reconstructed = set()
    pink_pass_factor = 1.30

    for (r_name, d_id, dt, trip_date, hr), grp in corridor_groups:
        pid = route_to_pattern.get(r_name)
        if not pid:
            base_r = r_name.replace("UP", "").replace("DOWN", "").replace("DN", "").strip()
            pid = route_to_pattern.get(base_r)
        if not pid or pid not in pattern_stops_map:
            continue

        pat_stops = pattern_stops_map[pid]
        n_stops = len(pat_stops)
        if n_stops < 2:
            continue

        routes_reconstructed.add(r_name)

        # Stop sequence boardings and alightings arrays
        boardings = np.zeros(n_stops, dtype=float)
        alightings = np.zeros(n_stops, dtype=float)

        for row in grp.itertuples(index=False):
            b_name = row.start_stop_name
            a_name = row.end_stop_name
            pax = float(row.passenger_count) * pink_pass_factor

            b_seq = resolve_stop_seq(b_name, pid, pat_stops)
            a_seq = resolve_stop_seq(a_name, pid, pat_stops)

            if b_seq is not None:
                boardings[min(n_stops - 1, b_seq)] += pax
            if a_seq is not None:
                alightings[min(n_stops - 1, a_seq)] += pax

        # Mass conservation: L_s = max(0, L_{s-1} + b_s - a_s), terminal L_{N-1} = 0
        loads = np.zeros(n_stops, dtype=float)
        curr_load = 0.0
        for s in range(n_stops - 1):
            curr_load = max(0.0, curr_load + boardings[s] - alightings[s])
            loads[s] = curr_load
        loads[n_stops - 1] = 0.0

        # Zone-level aggregation (8 zones)
        zone_loads = defaultdict(list)
        zone_b = defaultdict(float)
        zone_a = defaultdict(float)

        for s in range(n_stops):
            z_id = pat_stops[s][1]
            zone_loads[z_id].append(loads[s])
            zone_b[z_id] += boardings[s]
            zone_a[z_id] += alightings[s]

        for z in range(8):
            z_l = zone_loads.get(z, [curr_load])
            m_load = round(float(np.mean(z_l)), 1)
            mx_load = int(np.max(z_l))
            
            zone_facts.append({
                "route_id": r_name,
                "direction_id": int(d_id),
                "day_type": dt,
                "hour": int(hr),
                "zone_id": z,
                "trip_date": str(trip_date),
                "mean_load": m_load,
                "max_load": mx_load,
                "boardings_total": int(round(zone_b.get(z, 0.0))),
                "alightings_total": int(round(zone_a.get(z, 0.0))),
                "trip_count": len(grp),
                "data_tier": "organizer",
            })

    logger.info(f"Reconstructed {len(zone_facts):,} zone demand facts across {len(routes_reconstructed)} routes in {time.time()-t2:.2f}s.")

    # 5. Atomic Update to Database & Parquet Export
    logger.info("[5/6] Updating fact_zone_demand and exporting staging parquet...")
    df_facts = pd.DataFrame(zone_facts)
    
    # Save parquet for ML training
    staging_dir = os.path.join(root_dir, "data", "staging")
    os.makedirs(staging_dir, exist_ok=True)
    parquet_path = os.path.join(staging_dir, "staging_zone_loads.parquet")
    df_facts.to_parquet(parquet_path, index=False)
    logger.info(f"Saved {len(df_facts):,} rows to {parquet_path}.")

    with engine.begin() as conn:
        # Create fact_zone_demand table if not exists
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS fact_zone_demand (
                demand_id INTEGER PRIMARY KEY AUTOINCREMENT,
                route_id VARCHAR(64) NOT NULL,
                direction_id INTEGER NOT NULL,
                day_type VARCHAR(16) NOT NULL,
                hour INTEGER NOT NULL,
                zone_id INTEGER NOT NULL,
                trip_date VARCHAR(10) NOT NULL,
                mean_load FLOAT NOT NULL,
                max_load INTEGER NOT NULL,
                boardings_total INTEGER NOT NULL,
                alightings_total INTEGER NOT NULL,
                trip_count INTEGER DEFAULT 1,
                data_tier VARCHAR(32) DEFAULT 'organizer'
            );
        """))
        # Replace contents with real organizer facts
        conn.execute(text("DELETE FROM fact_zone_demand;"))
    
    df_facts.to_sql("fact_zone_demand", con=engine, if_exists="append", index=False, chunksize=10000)
    
    with engine.begin() as conn:
        # Set runtime metadata to organizer tier
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS sys_runtime_metadata (
                key VARCHAR(64) PRIMARY KEY,
                value VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))
        conn.execute(text("INSERT OR REPLACE INTO sys_runtime_metadata (key, value) VALUES ('data_mode', 'organizer');"))
        conn.execute(text("INSERT OR REPLACE INTO sys_runtime_metadata (key, value) VALUES ('active_tier', 'organizer');"))

    # 6. Trigger ML Retraining
    logger.info("[6/6] Retraining Random Forest and RCI Calibrator on organizer demand facts...")
    train_script = os.path.join(root_dir, "scripts", "train_models.py")
    if os.path.exists(train_script):
        import subprocess
        res = subprocess.run([sys.executable, train_script, "--data-path", parquet_path], capture_output=True, text=True)
        logger.info(f"ML Retraining output:\n{res.stdout}")
        if res.returncode != 0:
            logger.error(f"ML Retraining error:\n{res.stderr}")

    total_time = time.time() - t_start
    logger.info("==================================================================")
    logger.info(f"  SUCCESS! PIPELINE COMPLETED IN {total_time:.2f}s                ")
    logger.info(f"  - Total Tickets Ingested: {len(df):,}                           ")
    logger.info(f"  - Corridor Facts Created: {len(df_facts):,}                     ")
    logger.info("  - Active Provenance Tier: organizer                             ")
    logger.info("==================================================================")


def process_dataset(csv_path: str, db_url: Optional[str] = None):
    """Pipeline entrypoint for external callers (bootstrap.py / rebuild_from_real_data.py)."""
    if db_url is None:
        db_file = os.path.join(backend_dir, "crowdwise.db")
        db_url = f"sqlite:///{db_file}"
    return run_pipeline(csv_path, db_url)


if __name__ == "__main__":
    csv_file = os.path.join(root_dir, "data", "raw", "organizer", "October-Delhi.csv")
    db_file = os.path.join(backend_dir, "crowdwise.db")
    run_pipeline(csv_file, f"sqlite:///{db_file}")
