import sqlite3
import time
from pathlib import Path

db_path = Path(__file__).resolve().parent.parent / "backend" / "crowdwise.db"
print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(str(db_path))
cur = conn.cursor()

# Check existing indexes
cur.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='fact_zone_demand'")
existing = [row[0] for row in cur.fetchall()]
print(f"Existing indexes on fact_zone_demand: {existing}")

index_name = "idx_fact_demand_day_hour_route"
if index_name in existing:
    print(f"Index {index_name} already exists.")
else:
    print(f"Creating index {index_name}...")
    t0 = time.time()
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_fact_demand_day_hour_route 
        ON fact_zone_demand (day_type, hour, route_id, direction_id, mean_load, boardings_total);
    """)
    conn.commit()
    print(f"Index created in {time.time() - t0:.2f} seconds.")

# Benchmark single hour query
print("Benchmarking single hour demand aggregation (day_type='WEEKDAY', hour=8)...")
times = []
for _ in range(3):
    t_start = time.time()
    cur.execute("""
        SELECT route_id, direction_id, ROUND(AVG(mean_load), 1), SUM(boardings_total)
        FROM fact_zone_demand
        WHERE day_type = 'WEEKDAY' AND hour = 8
        GROUP BY route_id, direction_id
    """)
    rows = cur.fetchall()
    times.append((time.time() - t_start) * 1000)

print(f"Rows returned: {len(rows)}")
print(f"Query times (ms): {[round(t, 2) for t in times]} (average: {round(sum(times)/len(times), 2)} ms)")
conn.close()
