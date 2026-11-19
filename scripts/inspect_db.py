import sqlite3

conn = sqlite3.connect('backend/crowdwise.db')
cur = conn.cursor()
tables = ['dim_routes', 'dim_stops', 'dim_route_patterns', 'rel_pattern_stops', 'fact_zone_demand', 'fact_route_supply', 'fact_hourly_summary']
for t in tables:
    cur.execute(f"PRAGMA table_info('{t}')")
    cols = [f"{col[1]} ({col[2]})" for col in cur.fetchall()]
    print(f"\nTable {t}:")
    print(", ".join(cols))

cur.execute("SELECT * FROM fact_zone_demand LIMIT 2")
print("\nfact_zone_demand sample:", cur.fetchall())
cur.execute("SELECT * FROM fact_route_supply LIMIT 2")
print("\nfact_route_supply sample:", cur.fetchall())
