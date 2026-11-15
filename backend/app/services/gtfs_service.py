"""crowdwise/backend/app/services/gtfs_service.py
Streaming GTFS static ingestion and static transit layer service for CrowdWise.

Features:
- Streaming, memory-safe parsing of raw GTFS files (stops, routes, trips, stop_times, calendar, calendar_dates).
- Integration of 4-level direction resolution (direction_resolver.py).
- Integration of canonical day type mapping & 24h+ normalization (calendar_service.py).
- Integration of contiguous 8-zone route partitioning (stop_search_service.py).
- Derivation and bulk insertion of the 6 compact relational tables.
- Query API supporting downstream M2, M3, M4 modules (get_stop_sequence, get_route_supply, etc.).
"""
import os
import math
import logging
from collections import defaultdict
from typing import Dict, List, Tuple, Set, Optional, Any
import pandas as pd
from sqlalchemy import create_engine, select, delete
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.models.transit import (
    Base,
    DimStop,
    DimRoute,
    DimRoutePattern,
    RelPatternStop,
    DimTripStart,
    FactRouteSupply,
    create_all_tables,
    drop_all_tables,
)
from app.services.direction_resolver import (
    resolve_direction,
    compute_haversine_distance,
)
from app.services.calendar_service import (
    build_service_calendar_map,
    get_day_types_for_service,
    parse_gtfs_time_to_seconds,
    CANONICAL_DAY_TYPES,
)
from app.services.stop_search_service import (
    ZonePartitioner,
    haversine_distance_km,
    DELHI_LAT_DEG,
    DELHI_LON_DEG,
)

logger = logging.getLogger("crowdwise.gtfs_service")


def compute_cumulative_distances(coords: List[Tuple[float, float]]) -> List[float]:
    """Computes monotonic cumulative distance array starting from 0.0 km."""
    if not coords:
        return []
    cum_dist = [0.0]
    total = 0.0
    for i in range(1, len(coords)):
        step = haversine_distance_km(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1])
        total += step
        cum_dist.append(round(total, 3))
    return cum_dist


def ingest_gtfs_directory(
    gtfs_dir: str,
    db_url: str,
    chunksize: int = 100000,
    clean_tables: bool = True,
) -> Dict[str, int]:
    """Ingests a raw GTFS directory and populates the 6 compact derived tables.

    Args:
        gtfs_dir: Path to directory containing GTFS txt files.
        db_url: SQLAlchemy database URL (sqlite:///... or postgresql://...).
        chunksize: Number of stop_times rows to process per chunk.
        clean_tables: If True, drops/recreates or clears existing tables first.

    Returns:
        Dictionary of row counts inserted per table.
    """
    logger.info(f"Starting GTFS static ingestion from: {gtfs_dir} into {db_url}")
    engine = create_engine(db_url, echo=False)

    if clean_tables:
        drop_all_tables(engine)
        create_all_tables(engine)

    # -----------------------------------------------------------------------
    # Step 1: Load stops.txt -> dim_stops
    # -----------------------------------------------------------------------
    stops_file = os.path.join(gtfs_dir, "stops.txt")
    if not os.path.exists(stops_file):
        raise FileNotFoundError(f"Mandatory GTFS file missing: {stops_file}")

    stops_df = pd.read_csv(
        stops_file,
        dtype={"stop_id": str, "stop_code": str, "stop_name": str},
    )
    # Ensure required columns
    for col in ["stop_id", "stop_name", "stop_lat", "stop_lon"]:
        if col not in stops_df.columns:
            raise ValueError(f"stops.txt missing mandatory column: {col}")

    if "stop_code" not in stops_df.columns:
        stops_df["stop_code"] = stops_df["stop_id"]
    else:
        stops_df["stop_code"] = stops_df["stop_code"].fillna(stops_df["stop_id"])

    stops_df["stop_lat"] = stops_df["stop_lat"].astype(float)
    stops_df["stop_lon"] = stops_df["stop_lon"].astype(float)
    stops_df["is_terminal"] = False

    stop_coords: Dict[str, Tuple[float, float]] = {
        str(row["stop_id"]): (float(row["stop_lat"]), float(row["stop_lon"]))
        for _, row in stops_df.iterrows()
    }

    # -----------------------------------------------------------------------
    # Step 2: Load routes.txt -> dim_routes
    # -----------------------------------------------------------------------
    routes_file = os.path.join(gtfs_dir, "routes.txt")
    if not os.path.exists(routes_file):
        raise FileNotFoundError(f"Mandatory GTFS file missing: {routes_file}")

    routes_df = pd.read_csv(
        routes_file,
        dtype={"route_id": str, "agency_id": str, "route_short_name": str, "route_long_name": str},
    )
    if "agency_id" not in routes_df.columns:
        routes_df["agency_id"] = "DTC"
    else:
        routes_df["agency_id"] = routes_df["agency_id"].fillna("DTC")

    if "route_short_name" not in routes_df.columns:
        routes_df["route_short_name"] = routes_df["route_id"]
    else:
        routes_df["route_short_name"] = routes_df["route_short_name"].fillna(routes_df["route_id"])

    if "route_long_name" not in routes_df.columns:
        routes_df["route_long_name"] = routes_df["route_short_name"]
    else:
        routes_df["route_long_name"] = routes_df["route_long_name"].fillna(routes_df["route_short_name"])

    if "route_desc" not in routes_df.columns:
        routes_df["route_desc"] = None

    routes_lookup = {
        str(row["route_id"]): (str(row["route_short_name"]), str(row["route_long_name"]))
        for _, row in routes_df.iterrows()
    }

    # -----------------------------------------------------------------------
    # Step 3: Load calendar.txt & calendar_dates.txt
    # -----------------------------------------------------------------------
    cal_file = os.path.join(gtfs_dir, "calendar.txt")
    cal_dates_file = os.path.join(gtfs_dir, "calendar_dates.txt")

    cal_df = pd.read_csv(cal_file, dtype={"service_id": str}) if os.path.exists(cal_file) else None
    cal_dates_df = pd.read_csv(cal_dates_file, dtype={"service_id": str, "date": str}) if os.path.exists(cal_dates_file) else None

    service_to_days = build_service_calendar_map(cal_df, cal_dates_df)

    # -----------------------------------------------------------------------
    # Step 4: Load trips.txt
    # -----------------------------------------------------------------------
    trips_file = os.path.join(gtfs_dir, "trips.txt")
    if not os.path.exists(trips_file):
        raise FileNotFoundError(f"Mandatory GTFS file missing: {trips_file}")

    trips_df = pd.read_csv(
        trips_file,
        dtype={"route_id": str, "service_id": str, "trip_id": str},
    )

    trip_meta: Dict[str, Dict[str, Any]] = {}
    for row in trips_df.itertuples(index=False):
        tid = str(row.trip_id)
        d_id = getattr(row, "direction_id", None)
        s_id = getattr(row, "shape_id", None)
        h_sign = getattr(row, "trip_headsign", None)
        trip_meta[tid] = {
            "route_id": str(row.route_id),
            "service_id": str(row.service_id),
            "direction_id": d_id if pd.notnull(d_id) else None,
            "shape_id": str(s_id) if pd.notnull(s_id) else None,
            "trip_headsign": str(h_sign) if pd.notnull(h_sign) else None,
        }

    # -----------------------------------------------------------------------
    # Step 5: Streaming stop_times.txt
    # -----------------------------------------------------------------------
    stop_times_file = os.path.join(gtfs_dir, "stop_times.txt")
    if not os.path.exists(stop_times_file):
        raise FileNotFoundError(f"Mandatory GTFS file missing: {stop_times_file}")

    logger.info(f"Streaming stop_times from {stop_times_file}...")
    trip_stops: Dict[str, List[Tuple[int, str, str]]] = defaultdict(list)

    for chunk in pd.read_csv(
        stop_times_file,
        chunksize=chunksize,
        dtype={"trip_id": str, "stop_id": str, "stop_sequence": int},
        usecols=["trip_id", "departure_time", "stop_id", "stop_sequence"],
    ):
        for row in chunk.itertuples(index=False):
            tid = str(row.trip_id)
            seq = int(row.stop_sequence)
            sid = str(row.stop_id)
            dep_time = str(row.departure_time).strip()
            trip_stops[tid].append((seq, sid, dep_time))

    # -----------------------------------------------------------------------
    # Step 6: Identify canonical patterns, compute zones, and map trip starts
    # -----------------------------------------------------------------------
    logger.info("Resolving route patterns, 8-zone partitions, and trip departures...")
    pattern_definitions: Dict[Tuple[str, int, Tuple[str, ...]], str] = {}
    pattern_records: List[Dict[str, Any]] = []
    pattern_stops_records: List[Dict[str, Any]] = []
    trip_start_records: List[Dict[str, Any]] = []
    terminal_stops: Set[str] = set()

    pattern_counter = 0

    for tid, stops in trip_stops.items():
        if tid not in trip_meta:
            continue
        meta = trip_meta[tid]
        route_id = meta["route_id"]

        # Sort stops by stop_sequence
        stops.sort(key=lambda x: x[0])
        stop_ids_tuple = tuple(s[1] for s in stops)
        if not stop_ids_tuple:
            continue

        origin_stop_id = stop_ids_tuple[0]
        term_stop_id = stop_ids_tuple[-1]
        terminal_stops.add(origin_stop_id)
        terminal_stops.add(term_stop_id)

        # Retrieve route metadata for direction resolver
        r_short, r_long = routes_lookup.get(route_id, ("", ""))
        s_coords = [stop_coords.get(sid, (DELHI_LAT_DEG, DELHI_LON_DEG)) for sid in stop_ids_tuple]

        dir_id = resolve_direction(
            explicit_direction_id=meta["direction_id"],
            route_short_name=r_short,
            route_long_name=r_long,
            trip_id=tid,
            trip_headsign=meta["trip_headsign"],
            stop_coords=s_coords,
        )

        pattern_key = (route_id, dir_id, stop_ids_tuple)
        if pattern_key not in pattern_definitions:
            pattern_counter += 1
            pid = f"PAT_{route_id}_{dir_id}_{pattern_counter:04d}"
            pattern_definitions[pattern_key] = pid

            num_stops = len(stops)

            # Calculate cumulative distances and 8-zone partition
            cum_distances = compute_cumulative_distances(s_coords)
            tot_dist = cum_distances[-1] if cum_distances else 0.0

            pattern_records.append({
                "pattern_id": pid,
                "route_id": route_id,
                "direction_id": dir_id,
                "stop_count": num_stops,
                "total_dist_km": round(float(tot_dist), 3),
                "start_stop_id": origin_stop_id,
                "end_stop_id": term_stop_id,
                "shape_id": meta["shape_id"],
            })

            raw_sequences = [s[0] for s in stops]
            seq_to_zone = ZonePartitioner.partition_pattern_stops(raw_sequences)

            for idx, (seq, sid, _) in enumerate(stops):
                pattern_stops_records.append({
                    "pattern_id": pid,
                    "stop_sequence": idx,  # Canonical 0-indexed sequence along pattern
                    "stop_id": sid,
                    "zone_id": seq_to_zone.get(seq, min(7, (idx * 8) // max(1, num_stops))),
                    "cum_dist_km": cum_distances[idx],
                })
        else:
            pid = pattern_definitions[pattern_key]

        # Origin departure time parsing and 24h+ rollover normalization
        origin_dep_raw = stops[0][2]
        try:
            _, dep_hour, norm_dep_str, _ = parse_gtfs_time_to_seconds(origin_dep_raw)
        except Exception as e:
            logger.warning(f"Error parsing departure time '{origin_dep_raw}' on trip {tid}: {e}. Fallback to 00:00:00")
            dep_hour = 0
            norm_dep_str = "00:00:00"

        # Expand trip across active canonical day types
        active_day_types = get_day_types_for_service(meta["service_id"], service_to_days)
        for dt in active_day_types:
            trip_start_records.append({
                "trip_id": f"{tid}_{dt}",
                "route_id": route_id,
                "pattern_id": pid,
                "direction_id": dir_id,
                "service_id": meta["service_id"],
                "departure_time": norm_dep_str,
                "departure_hour": dep_hour,
                "day_type": dt,
            })

    # Update is_terminal on stops
    stops_df["is_terminal"] = stops_df["stop_id"].isin(terminal_stops)

    # -----------------------------------------------------------------------
    # Step 7: Compute fact_route_supply aggregations
    # -----------------------------------------------------------------------
    logger.info("Computing fact_route_supply hourly departures and average headway...")
    supply_counter: Dict[Tuple[str, int, str, int], int] = defaultdict(int)
    for ts in trip_start_records:
        k = (ts["route_id"], ts["direction_id"], ts["day_type"], ts["departure_hour"])
        supply_counter[k] += 1

    supply_records: List[Dict[str, Any]] = []
    for (r_id, d_id, dt, hr), count in supply_counter.items():
        headway = round(60.0 / max(1, count), 1)
        supply_records.append({
            "route_id": r_id,
            "direction_id": d_id,
            "day_type": dt,
            "hour": hr,
            "trips_per_hour": count,
            "avg_headway_min": headway,
        })

    # -----------------------------------------------------------------------
    # Step 8: Bulk Insertion into Database
    # -----------------------------------------------------------------------
    logger.info("Writing all 6 compact derived tables to database...")

    # Filter columns to match ORM tables strictly
    stops_to_insert = stops_df[["stop_id", "stop_code", "stop_name", "stop_lat", "stop_lon", "is_terminal"]]
    routes_to_insert = routes_df[["route_id", "agency_id", "route_short_name", "route_long_name", "route_desc"]]

    stops_to_insert.to_sql("dim_stops", engine, if_exists="append", index=False, chunksize=5000)
    routes_to_insert.to_sql("dim_routes", engine, if_exists="append", index=False, chunksize=2000)

    if pattern_records:
        pd.DataFrame(pattern_records).to_sql("dim_route_patterns", engine, if_exists="append", index=False, chunksize=2000)
    if pattern_stops_records:
        pd.DataFrame(pattern_stops_records).to_sql("rel_pattern_stops", engine, if_exists="append", index=False, chunksize=10000)
    if trip_start_records:
        pd.DataFrame(trip_start_records).to_sql("dim_trip_starts", engine, if_exists="append", index=False, chunksize=10000)
    if supply_records:
        pd.DataFrame(supply_records).to_sql("fact_route_supply", engine, if_exists="append", index=False, chunksize=5000)

    counts = {
        "dim_stops": len(stops_df),
        "dim_routes": len(routes_df),
        "dim_route_patterns": len(pattern_records),
        "rel_pattern_stops": len(pattern_stops_records),
        "dim_trip_starts": len(trip_start_records),
        "fact_route_supply": len(supply_records),
    }

    logger.info(f"Ingestion successful! Row counts: {counts}")
    return counts


# ---------------------------------------------------------------------------
# Query Interface Methods for Downstream Modules
# ---------------------------------------------------------------------------

def get_default_engine(db_url: Optional[str] = None) -> Engine:
    """Retrieves default SQLAlchemy engine bound to local crowdwise.db."""
    default_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "crowdwise.db"))
    url = db_url or os.environ.get("CROWDWISE_DB_URL", f"sqlite:///{default_path}")
    return create_engine(url)


def get_stop_sequence(pattern_id: str, session: Optional[Session] = None) -> List[Tuple[int, str, int]]:
    """Retrieves ordered (stop_sequence, stop_id, zone_id) tuples for a route pattern.

    Contract: M1 <-> M2
    """
    stmt = (
        select(RelPatternStop.stop_sequence, RelPatternStop.stop_id, RelPatternStop.zone_id)
        .where(RelPatternStop.pattern_id == pattern_id)
        .order_by(RelPatternStop.stop_sequence)
    )
    if session is not None:
        return list(session.execute(stmt).all())

    engine = get_default_engine()
    with Session(engine) as auto_session:
        return list(auto_session.execute(stmt).all())


def load_all_stops(session: Optional[Session] = None) -> List[Dict[str, Any]]:
    """Loads all physical stops from dim_stops as a list of dicts for search indexing."""
    stmt = select(DimStop)
    if session is not None:
        records = session.execute(stmt).scalars().all()
        return [r.to_dict() for r in records]

    engine = get_default_engine()
    with Session(engine) as auto_session:
        records = auto_session.execute(stmt).scalars().all()
        return [r.to_dict() for r in records]


def get_route_patterns(route_id: str, session: Optional[Session] = None) -> List[Dict[str, Any]]:
    """Retrieves all patterns associated with a route_id."""
    stmt = select(DimRoutePattern).where(DimRoutePattern.route_id == route_id)
    if session is not None:
        records = session.execute(stmt).scalars().all()
        return [r.to_dict() for r in records]

    engine = get_default_engine()
    with Session(engine) as auto_session:
        records = auto_session.execute(stmt).scalars().all()
        return [r.to_dict() for r in records]


def get_route_supply(
    route_id: str,
    direction_id: int,
    day_type: str,
    hour: int,
    session: Optional[Session] = None,
) -> Optional[Dict[str, Any]]:
    """Retrieves scheduled route supply metrics for given route, direction, day type, and hour."""
    stmt = select(FactRouteSupply).where(
        FactRouteSupply.route_id == route_id,
        FactRouteSupply.direction_id == direction_id,
        FactRouteSupply.day_type == day_type,
        FactRouteSupply.hour == hour,
    )
    if session is not None:
        record = session.execute(stmt).scalar_one_or_none()
        return record.to_dict() if record else None

    engine = get_default_engine()
    with Session(engine) as auto_session:
        record = auto_session.execute(stmt).scalar_one_or_none()
        return record.to_dict() if record else None
