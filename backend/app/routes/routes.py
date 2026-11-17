"""Routes details and corridor information endpoints."""
import time
from flask import Blueprint, request
from sqlalchemy import select, and_
from app import db
from app.models.transit import (
    DimRoute,
    DimRoutePattern,
    RelPatternStop,
    DimStop,
    FactRouteSupply,
)
from app.services.ml_service import MLService
from app.utils.envelope import api_response

bp = Blueprint("routes", __name__)


@bp.route("", methods=["GET"])
def list_routes():
    """Returns paginated list of bus routes."""
    t0 = time.time()
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(100, max(1, int(request.args.get("limit", 20))))
    except (ValueError, TypeError):
        page = 1
        per_page = 20
        
    q = request.args.get("q", "").strip()
    
    stmt = select(DimRoute)
    if q:
        stmt = stmt.where(
            (DimRoute.route_short_name.ilike(f"%{q}%")) | (DimRoute.route_long_name.ilike(f"%{q}%"))
        )
    stmt = stmt.offset((page - 1) * per_page).limit(per_page)
    routes = db.session.execute(stmt).scalars().all()
    
    results = [
        {
            "route_id": r.route_id,
            "route_short_name": r.route_short_name,
            "route_long_name": r.route_long_name,
            "agency_id": getattr(r, "agency_id", "DTC"),
            "route_type": getattr(r, "route_type", 3),
        }
        for r in routes
    ]
    return api_response(data=results, data_tier="real_public", start_time=t0)


@bp.route("/<route_id>", methods=["GET"])
def get_route_details(route_id: str):
    """Returns detailed corridor layout, directions, ordered stops, and zone partitions."""
    t0 = time.time()
    clean_id = str(route_id).strip()
    
    # Clean check for invalid route IDs
    if not clean_id or clean_id in ("-1", "undefined", "null"):
        return api_response(
            error={"code": "ROUTE_NOT_FOUND", "message": f"Route '{route_id}' does not exist"},
            status_code=404,
            start_time=t0,
        )

    try:
        direction_id = int(request.args.get("direction", 0))
    except (ValueError, TypeError):
        direction_id = 0
        
    try:
        hour = int(request.args.get("hour", 18))
    except (ValueError, TypeError):
        hour = 18
        
    day_type = request.args.get("day_type", "WEEKDAY")
    
    route = db.session.execute(
        select(DimRoute).where(
            (DimRoute.route_id == clean_id) | (DimRoute.route_short_name.ilike(clean_id))
        )
    ).scalars().first()

    # Route not found in DB - check demo aliases or return 404
    if not route:
        if clean_id.upper() in ("101UP", "101DN", "101", "8UP", "DEMO", "DEFAULT"):
            route = db.session.execute(select(DimRoute).where(DimRoute.route_id == "102A")).scalars().first()
            if not route:
                route = db.session.execute(select(DimRoute).limit(1)).scalars().first()

    if not route:
        return api_response(
            error={"code": "ROUTE_NOT_FOUND", "message": f"Route '{route_id}' not found."},
            status_code=404,
            start_time=t0,
        )
        
    # Find dominant pattern for this route and direction
    patterns = db.session.execute(
        select(DimRoutePattern)
        .where(
            and_(
                DimRoutePattern.route_id == route.route_id,
                DimRoutePattern.direction_id == direction_id,
            )
        )
    ).scalars().all()
    if not patterns:
        patterns = db.session.execute(
            select(DimRoutePattern).where(DimRoutePattern.route_id == route.route_id)
        ).scalars().all()
    
    pattern = patterns[0] if patterns else None
    
    ordered_stops = []
    if pattern:
        stops_stmt = (
            select(RelPatternStop, DimStop)
            .join(DimStop, RelPatternStop.stop_id == DimStop.stop_id)
            .where(RelPatternStop.pattern_id == pattern.pattern_id)
            .order_by(RelPatternStop.stop_sequence)
        )
        stop_rows = db.session.execute(stops_stmt).all()
        
        for rel, st in stop_rows:
            dist_val = round(float(getattr(rel, "cum_dist_km", 0.0) or 0.0), 2)
            ordered_stops.append({
                "sequence": int(rel.stop_sequence),
                "stop_sequence": int(rel.stop_sequence),
                "stop_id": st.stop_id,
                "stop_name": st.stop_name,
                "stop_lat": st.stop_lat,
                "stop_lon": st.stop_lon,
                "zone_id": int(rel.zone_id),
                "distance_km": dist_val,
                "cum_dist_km": dist_val,
            })

    # Enrich stops with timeline fields and occupancyToNextStop
    n_ord = len(ordered_stops)
    ml_service = MLService.get_instance()
    for idx, st in enumerate(ordered_stops):
        st["id"] = st["stop_id"]
        st["name"] = st["stop_name"]
        st["isOrigin"] = (idx == 0)
        st["isDestination"] = (idx == n_ord - 1)
        st["is_origin"] = (idx == 0)
        st["is_destination"] = (idx == n_ord - 1)
        st["distanceKm"] = "0.0 km" if idx == 0 else f"+{round(st.get('distance_km', idx * 0.5), 1)} km"

        dep_h = hour
        approx_min = (idx * 2) % 60
        period = "pm" if dep_h >= 12 else "am"
        h12 = dep_h % 12 or 12
        st["time"] = f"{h12}:{approx_min:02d} {period}"

        if idx < n_ord - 1:
            zid = st.get("zone_id", min(7, int(idx / max(1, n_ord - 1) * 8)))
            pred = ml_service.predict_crowd(
                route_id=clean_id,
                direction_id=direction_id,
                zone_id=int(zid),
                day_type=day_type,
                hour=hour,
            )
            rci = float(pred.get("rci", 50.0))
            occ_ratio = round(max(0.15, min(0.95, rci / 100.0)), 2)
            st["occupancyToNextStop"] = occ_ratio
            st["occupancy_to_next_stop"] = occ_ratio
        else:
            st["occupancyToNextStop"] = None
            st["occupancy_to_next_stop"] = None
            
    # Get 24-hour crowding profile for this route
    ml_service = MLService.get_instance()
    hourly_crowd = []
    hourly_rci_list = []
    for h in range(24):
        pred = ml_service.predict_crowd(
            route_id=clean_id,
            direction_id=direction_id,
            zone_id=3,  # Mid-corridor zone
            day_type=day_type,
            hour=h,
        )
        hourly_rci = pred["rci"]
        hourly_rci_list.append(hourly_rci)
        hourly_crowd.append({
            "hour": h,
            "load": pred["load"],
            "rci": hourly_rci,
            "category": pred["category"],
        })
        
    polyline_coords = [[s["stop_lat"], s["stop_lon"]] for s in ordered_stops]

    data = {
        "route_id": route.route_id,
        "route_short_name": route.route_short_name,
        "route_long_name": route.route_long_name,
        "agency_id": getattr(route, "agency_id", "DTC"),
        "direction_id": direction_id,
        "pattern_id": pattern.pattern_id if pattern else None,
        "total_stops": len(ordered_stops),
        "total_distance_km": round(float(pattern.total_dist_km or 0.0), 2) if pattern else 0.0,
        "stops": ordered_stops,
        "polyline": polyline_coords,
        "polyline_coords": polyline_coords,
        "hourly_profile": hourly_rci_list,
        "hourly_crowd_profile": hourly_crowd,
    }
    return api_response(data=data, data_tier="estimated", start_time=t0)
