"""Crowd estimation and matrix querying endpoints."""
import time
from flask import Blueprint, request
from app.services.ml_service import MLService
from app.utils.envelope import api_response

bp = Blueprint("crowd", __name__, url_prefix="/api")

_crowd_matrix_cache = {}


@bp.route("/crowd/<route_id>", methods=["GET"])
@bp.route("/crowd/profile/<route_id>", methods=["GET"])
def get_route_crowd_matrix(route_id: str):
    """Returns 8-zone x 24-hour crowdedness matrix for heatmaps and profiles."""
    t0 = time.time()
    direction_id = int(request.args.get("direction", 0))
    day_type = request.args.get("day_type", "WEEKDAY").upper()
    
    cache_key = (str(route_id).upper(), direction_id, day_type)
    if cache_key in _crowd_matrix_cache:
        return api_response(data=_crowd_matrix_cache[cache_key], start_time=t0)
    
    ml_service = MLService.get_instance()
    
    matrix = []
    zone_profiles = []
    hourly_loads = {h: [] for h in range(24)}
    hourly_rcis = {h: [] for h in range(24)}

    for z in range(8):
        zone_row = {"zone_id": z, "hours": []}
        z_loads = []
        for h in range(24):
            pred = ml_service.predict_crowd(
                route_id=str(route_id),
                direction_id=direction_id,
                zone_id=z,
                day_type=day_type,
                hour=h,
            )
            zone_row["hours"].append({
                "hour": h,
                "load": pred["load"],
                "rci": pred["rci"],
                "category": pred["category"],
            })
            z_loads.append(pred["load"])
            hourly_loads[h].append(pred["load"])
            hourly_rcis[h].append(pred["rci"])
        matrix.append(zone_row)
        z_mean = sum(z_loads) / len(z_loads) if z_loads else 0.0
        zone_profiles.append({
            "zone_id": z,
            "mean_load": round(z_mean, 1),
            "rci": min(100.0, round(z_mean * 2.0, 1)),
            "crowd_category": "Crowded" if z_mean > 35 else "Standing Room" if z_mean > 20 else "Seats Available"
        })

    hourly_profile = []
    for h in range(24):
        h_mean = sum(hourly_loads[h]) / len(hourly_loads[h]) if hourly_loads[h] else 0.0
        h_rci = sum(hourly_rcis[h]) / len(hourly_rcis[h]) if hourly_rcis[h] else 0.0
        hourly_profile.append({
            "hour": h,
            "mean_load": round(h_mean, 1),
            "max_load": round(max(hourly_loads[h]) if hourly_loads[h] else 0.0, 1),
            "rci": round(h_rci, 1),
            "crowd_category": "Crowded" if h_rci > 85 else "Standing Room" if h_rci >= 50 else "Seats Available"
        })
        
    data = {
        "route_id": str(route_id),
        "direction_id": direction_id,
        "day_type": day_type,
        "matrix": matrix,
        "zone_profiles": zone_profiles,
        "hourly_profile": hourly_profile,
    }
    if len(_crowd_matrix_cache) > 200:
        _crowd_matrix_cache.clear()
    _crowd_matrix_cache[cache_key] = data
    return api_response(data=data, start_time=t0)


@bp.route("/predict-crowd", methods=["POST"])
def predict_crowd_point():
    """Predicts crowding for a single requested cell."""
    t0 = time.time()
    body = request.get_json(silent=True) or {}
    
    route_id = str(body.get("route_id", "8UP"))
    direction_id = int(body.get("direction_id", 0))
    zone_id = int(body.get("zone_id", 0))
    day_type = str(body.get("day_type", "WEEKDAY"))
    hour = int(body.get("hour", 18))
    
    ml_service = MLService.get_instance()
    pred = ml_service.predict_crowd(
        route_id=route_id,
        direction_id=direction_id,
        zone_id=zone_id,
        day_type=day_type,
        hour=hour,
    )
    return api_response(data=pred, start_time=t0)
