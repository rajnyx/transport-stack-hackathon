"""Standard API response envelope helper with provenance and degradation support."""
from datetime import datetime, timezone
import time
from typing import Any, Optional, Dict, List, Union
from flask import jsonify, current_app, request


def api_response(
    data: Any = None,
    error: Optional[Dict[str, Any]] = None,
    status_code: int = 200,
    data_tier: Optional[str] = None,
    start_time: Optional[float] = None,
    warning: Optional[Union[str, List[str]]] = None,
    degraded_mode: Optional[bool] = None,
    extra_meta: Optional[Dict[str, Any]] = None,
):
    """Generates consistent API envelope for all CrowdWise endpoints.
    
    Format:
    {
        "ok": bool,
        "data": Any,
        "error": { "code": str, "message": str, "details": dict } | null,
        "meta": {
            "version": "1.0.0",
            "data_tier": "demo_synthetic" | "organizer" | "real_public" | "estimated",
            "data_mode": "demo" | "organizer",
            "provenance": {
                "timetable": "real_public",
                "tickets": "demo_synthetic" | "organizer",
                "crowd": "estimated"
            },
            "timestamp": "ISO-8601 UTC",
            "execution_time_ms": float,
            "degraded_mode": bool,
            "warning": str | list (optional)
        }
    }
    """
    elapsed_ms = round(max(0.0, (time.time() - start_time) * 1000.0), 2) if start_time else 0.0
    
    # Active runtime data mode
    data_mode = current_app.config.get("DATA_MODE", "organizer") if current_app else "organizer"
    ticket_tier = "organizer" if data_mode in ("organizer", "production", "live") else "real_public"
    
    # Determine top-level tier
    if data_tier:
        tier_label = data_tier
    else:
        tier_label = ticket_tier
        
    meta: Dict[str, Any] = {
        "version": "1.0.0",
        "data_tier": tier_label,
        "data_mode": data_mode,
        "provenance": {
            "timetable": "real_public",
            "tickets": ticket_tier,
            "crowd": "estimated",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "execution_time_ms": elapsed_ms,
    }
    
    if degraded_mode is not None:
        meta["degraded_mode"] = degraded_mode
        
    if warning:
        meta["warning"] = warning
        if degraded_mode is None:
            meta["degraded_mode"] = True

    if extra_meta and isinstance(extra_meta, dict):
        meta.update(extra_meta)

    envelope = {
        "ok": error is None and status_code < 400,
        "data": data,
        "error": error,
        "meta": meta,
    }
    return jsonify(envelope), status_code
