import sqlite3

conn = sqlite3.connect('backend/crowdwise.db')
cur = conn.cursor()

# Check distinct day_types in fact_zone_demand and fact_route_supply
cur.execute("SELECT DISTINCT day_type FROM fact_zone_demand")
print("fact_zone_demand day_types:", cur.fetchall())
cur.execute("SELECT DISTINCT day_type FROM fact_route_supply")
print("fact_route_supply day_types:", cur.fetchall())

# Check sample routes in fact_zone_demand
cur.execute("""
    SELECT d.route_id, d.direction_id, d.day_type, d.hour, 
           AVG(d.mean_load) as avg_load, 
           MAX(d.max_load) as max_load, 
           SUM(d.boardings_total) as total_tickets
    FROM fact_zone_demand d
    WHERE d.day_type = 'WEEKDAY' AND d.hour = 8
    GROUP BY d.route_id, d.direction_id
    ORDER BY total_tickets DESC
    LIMIT 10
""")
rows = cur.fetchall()
print("\nTop 10 routes in fact_zone_demand for WEEKDAY hour 8:")
for r in rows:
    print(r)

# Check join with fact_route_supply
cur.execute("""
    SELECT d.route_id, d.direction_id, d.day_type, d.hour,
           AVG(d.mean_load) as avg_load,
           SUM(d.boardings_total) as total_tickets,
           s.trips_per_hour
    FROM fact_zone_demand d
    LEFT JOIN fact_route_supply s 
      ON d.route_id = s.route_id 
     AND d.direction_id = s.direction_id 
     AND d.day_type = s.day_type 
     AND d.hour = s.hour
    WHERE d.day_type = 'WEEKDAY' AND d.hour = 8
    GROUP BY d.route_id, d.direction_id
    ORDER BY total_tickets DESC
    LIMIT 10
""")
print("\nTop 10 routes joined with fact_route_supply:")
for r in cur.fetchall():
    print(r)
