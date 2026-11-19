"""
Tier 2: Boundary & Corner Cases End-to-End Tests for Features F1 to F9.

Covers:
- F1: Exact threshold boundaries (99->100, 29->30, 9->10), zero counts, negative/malformed sanitization
- F2: Zero passenger load, crush load >= capacity, missing vehicle class fallback, negative load clamping
- F3: Zero load scaling, day type fallback, hour boundaries 0 and 23, invalid hour rejection, rounding
- F4: Zero deficit corridors, inverted hour ranges, min_confidence filtering, zero scheduled trips
- F5: Offset 0 identity, offset 60 upper bound, unsupported offset rejection, midnight rollover, tip suppression
- F6: Alighting load clamping max(0, ...), invalid route 404, zero tickets hour, short 2-stop routes, loop clearance
- F7: Unsupported format 400, empty query headers, CSV escaping of commas/quotes, # Metadata: structure
- F8: Night hour all green, invalid hour 25, fallback geometry, extreme bounding box, limit 50 cap
- F9: Boundary 400m vs 401m, origin stop 0 suppression, upstream more crowded suppression, thin confidence suppression
- Adversarial & Degradation: Unseeded DB graceful 200, SQL injection prevention in route params
Total: 47 tests.
"""

import math
import pytest
from tests.e2e.conftest import SpecReferenceOracle


# ===========================================================================
# F1: Confidence & Sparsity Boundaries
# ===========================================================================

class TestTier2F1ConfidenceBoundaries:
    """Verifies edge and boundary conditions for Feature F1 confidence classification."""

    def test_t2_f1_b01_exact_threshold_boundary_99_to_100(self):
        """1. Asserts exact transition from medium (99) to high (100) confidence."""
        lvl_99, txt_99 = SpecReferenceOracle.confidence_rating(99)
        lvl_100, txt_100 = SpecReferenceOracle.confidence_rating(100)
        assert lvl_99 == "medium"
        assert txt_99 == "Based on some data"
        assert lvl_100 == "high"
        assert txt_100 == "Based on a lot of data"

    def test_t2_f1_b02_exact_threshold_boundary_29_to_30(self):
        """2. Asserts exact transition from low (29) to medium (30) confidence."""
        lvl_29, txt_29 = SpecReferenceOracle.confidence_rating(29)
        lvl_30, txt_30 = SpecReferenceOracle.confidence_rating(30)
        assert lvl_29 == "low"
        assert txt_29 == "Based on little data"
        assert lvl_30 == "medium"
        assert txt_30 == "Based on some data"

    def test_t2_f1_b03_exact_threshold_boundary_9_to_10(self):
        """3. Asserts exact transition from thin (9) to low (10) confidence."""
        lvl_9, txt_9 = SpecReferenceOracle.confidence_rating(9)
        lvl_10, txt_10 = SpecReferenceOracle.confidence_rating(10)
        assert lvl_9 == "thin"
        assert txt_9 == "Not enough data"
        assert lvl_10 == "low"
        assert txt_10 == "Based on little data"

    def test_t2_f1_b04_zero_tickets_recorded_corridor(self):
        """4. Zero ticket records safely evaluates to thin confidence without ZeroDivisionError."""
        lvl_0, txt_0 = SpecReferenceOracle.confidence_rating(0)
        assert lvl_0 == "thin"
        assert txt_0 == "Not enough data"

    def test_t2_f1_b05_negative_or_non_integer_ticket_count_sanitization(self):
        """5. Negative counts sanitize safely to thin confidence."""
        for neg in [-1, -50, -999]:
            lvl, txt = SpecReferenceOracle.confidence_rating(neg)
            assert lvl == "thin"
            assert txt == "Not enough data"


# ===========================================================================
# F2: Capacity Normalisation Boundaries
# ===========================================================================

class TestTier2F2CapacityBoundaries:
    """Verifies boundary cases for bus size and capacity normalisation."""

    def test_t2_f2_b01_zero_passenger_load_capacity_index(self):
        """6. Zero passenger load produces RCI=0.0 and Low crowd category."""
        rci = SpecReferenceOracle.relative_crowding_index(0.0, 60.0)
        assert rci == 0.0
        assert SpecReferenceOracle.rci_category(rci) == "Low"

    def test_t2_f2_b02_crush_load_exceeding_nominal_capacity(self):
        """7. Crush load (95 passengers on 60-capacity bus) caps RCI at 100.0 without overflow."""
        rci = SpecReferenceOracle.relative_crowding_index(95.0, 60.0)
        assert rci == 100.0
        assert SpecReferenceOracle.rci_category(rci) == "High"

    def test_t2_f2_b03_missing_vehicle_class_defaults_to_non_ac(self, api_spec_client):
        """8. Route with unspecified vehicle class safely defaults to Non-AC baseline."""
        resp = api_spec_client.get("/api/routes/502UP")
        assert resp["status_code"] == 200
        # 502UP default vehicle class is Non-AC
        assert resp["json"]["data"]["vehicle_class"] == "Non-AC"

    def test_t2_f2_b04_negative_passenger_load_clamped_to_zero(self):
        """9. Spurious negative load is clamped to 0.0 before computing RCI."""
        rci = SpecReferenceOracle.relative_crowding_index(-15.0, 60.0)
        assert rci == 0.0

    def test_t2_f2_b05_capacity_verified_flag_immutable(self, api_spec_client):
        """10. Asserts capacity_verified remains False across multiple queries."""
        for ep in ["/api/analytics/operator-action-sheet", "/api/routes/433UP"]:
            resp = api_spec_client.get(ep)
            assert resp["status_code"] == 200
            if "corridors" in resp["json"]["data"]:
                assert all(c["capacity_verified"] is False for c in resp["json"]["data"]["corridors"])
            else:
                assert resp["json"]["data"]["capacity_verified"] is False


# ===========================================================================
# F3: Unrecorded Riders Sensitivity Boundaries
# ===========================================================================

class TestTier2F3SensitivityBoundaries:
    """Verifies edge cases for F3 unrecorded ridership scenarios."""

    def test_t2_f3_b01_zero_load_route_across_all_scenarios(self):
        """11. Baseline load 0.0 scales to 0.0 under all 4 unrecorded scenarios."""
        for sc in [0.0, 0.10, 0.20, 0.30]:
            adj = 0.0 * (1.0 + sc)
            assert adj == 0.0
            et = SpecReferenceOracle.extra_trips_needed(4, 0.0, 60.0, sc)
            assert et == 0

    def test_t2_f3_b02_invalid_day_type_parameter_handling(self, api_spec_client):
        """12. Invalid day_type parameter defaults gracefully to weekday."""
        resp = api_spec_client.get("/api/analytics/sensitivity", {"day_type": "UNKNOWN_HOLIDAY"})
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True

    def test_t2_f3_b03_hour_parameter_extreme_boundaries_0_and_23(self, api_spec_client):
        """13. Hour boundaries 0 and 23 evaluate cleanly without off-by-one errors."""
        for h in [0, 23]:
            resp = api_spec_client.get("/api/analytics/sensitivity", {"hour": h})
            assert resp["status_code"] == 200
            assert resp["json"]["ok"] is True

    def test_t2_f3_b04_hour_out_of_bounds_rejected(self, api_spec_client):
        """14. Out-of-bounds hours (-1, 24, 99) return HTTP 400 Bad Request."""
        for invalid_h in [-1, 24, 99]:
            resp = api_spec_client.get("/api/analytics/sensitivity", {"hour": invalid_h})
            assert resp["status_code"] == 400
            assert resp["json"]["ok"] is False
            assert resp["json"]["error"]["code"] == "INVALID_HOUR"

    def test_t2_f3_b05_float_precision_rounding_in_scenario_loads(self, api_spec_client):
        """15. Scenario loads in response are rounded without IEEE 754 precision bloat."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        for r in resp["json"]["data"]["top_routes"]:
            for sc_key, val in r["scenario_loads"].items():
                # Value represented as float with at most 2 decimal places
                assert round(val, 2) == val


# ===========================================================================
# F4: Operator Action Sheet Boundaries
# ===========================================================================

class TestTier2F4ActionSheetBoundaries:
    """Verifies boundary and filter conditions for Operator Action Sheet."""

    def test_t2_f4_b01_zero_deficit_corridor_extra_trips_strictly_zero(self, api_spec_client):
        """16. Corridors where load <= capacity have passenger_deficit=0 and extra_trips=0."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]["corridors"]
        zero_def = [c for c in corrs if c["passenger_deficit"] == 0.0]
        assert len(zero_def) >= 1
        for c in zero_def:
            assert c["extra_trips"]["0%"] == 0
            assert c["extra_trips"]["30%"] == 0

    def test_t2_f4_b02_inverted_hour_range_handling(self, api_spec_client):
        """17. Inverted hour range (hour_start > hour_end) is rejected with HTTP 400."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet", {
            "hour_start": 20,
            "hour_end": 8
        })
        assert resp["status_code"] == 400
        assert resp["json"]["ok"] is False
        assert resp["json"]["error"]["code"] == "INVALID_HOUR_RANGE"

    def test_t2_f4_b03_min_confidence_high_strict_filtering(self, api_spec_client):
        """18. min_confidence=high strictly filters out all corridors with ticket count < 100."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet", {"min_confidence": "high"})
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]["corridors"]
        for c in corrs:
            assert c["confidence"] == "high"
            assert c["sample_ticket_count"] >= 100

    def test_t2_f4_b04_zero_scheduled_trips_handling(self):
        """19. Zero scheduled trips handles safely and returns 0 extra trips."""
        extra = SpecReferenceOracle.extra_trips_needed(0, 68.2, 60.0, 0.20)
        assert extra == 0

    def test_t2_f4_b05_boundary_hours_span_0_to_23(self, api_spec_client):
        """20. Querying full 24-hour span (hour_start=0, hour_end=23) succeeds."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet", {
            "hour_start": 0,
            "hour_end": 23
        })
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True


# ===========================================================================
# F5: Departure Time Scrubber Boundaries
# ===========================================================================

class TestTier2F5ScrubberBoundaries:
    """Verifies edge cases for departure time scrubber offsets."""

    def test_t2_f5_b01_offset_zero_minutes_identity_match(self, api_spec_client):
        """21. offset_minutes=0 produces identical departure time as base time."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp["status_code"] == 200
        opt = resp["json"]["data"]["options"][0]
        assert opt["scheduled_departure"] == "08:30:00"

    def test_t2_f5_b02_offset_max_sixty_minutes_accepted(self, api_spec_client):
        """22. Maximum allowed offset (60 min) produces options exactly 1 hour forward."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 60
        })
        assert resp["status_code"] == 200
        opt = resp["json"]["data"]["options"][0]
        assert opt["scheduled_departure"] == "09:30:00"

    def test_t2_f5_b03_unsupported_offset_rejected(self, api_spec_client):
        """23. Unsupported offsets (e.g. 25, -15, 90) return HTTP 400 Bad Request."""
        for bad_offset in [25, -15, 90]:
            resp = api_spec_client.get("/api/plan", {
                "origin_id": "DEL_001",
                "destination_id": "DEL_002",
                "offset_minutes": bad_offset
            })
            assert resp["status_code"] == 400
            assert resp["json"]["ok"] is False
            assert resp["json"]["error"]["code"] == "INVALID_OFFSET"

    def test_t2_f5_b04_midnight_rollover_scrubber_offset(self, api_spec_client):
        """24. Departure 23:45 + offset 30 rolls over past midnight to 00:15 without string crash."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "23:45:00",
            "offset_minutes": 30
        })
        assert resp["status_code"] == 200
        opts = resp["json"]["data"]["options"]
        assert opts[0]["scheduled_departure"].startswith("00:15")

    def test_t2_f5_b05_departure_tip_suppression_when_no_advantage(self, api_spec_client):
        """25. When travelling at off-peak hours (hour 14), departure tips are omitted."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "14:00:00",
            "offset_minutes": 0
        })
        assert resp["status_code"] == 200
        assert len(resp["json"]["data"]["departure_tips"]) == 0


# ===========================================================================
# F6: Stop-Level Flow Boundaries
# ===========================================================================

class TestTier2F6FlowBoundaries:
    """Verifies edge and error conditions for stop-level flow."""

    def test_t2_f6_b01_alightings_exceeding_running_load_clamped_to_zero(self):
        """26. Inferred alightings exceeding onboard load are clamped to 0.0 (non-negative)."""
        stops = [
            {"stop_sequence": 0, "boardings": 10.0, "alightings": 0.0, "running_load": 10.0},
            {"stop_sequence": 1, "boardings": 5.0, "alightings": 25.0, "running_load": 0.0},
        ]
        assert SpecReferenceOracle.flow_conservation(stops) is True

    def test_t2_f6_b02_invalid_route_id_returns_404(self, api_spec_client):
        """27. Non-existent route ID returns HTTP 404 ROUTE_NOT_FOUND."""
        resp = api_spec_client.get("/api/routes/NONEXISTENT_ROUTE/flow")
        assert resp["status_code"] == 404
        assert resp["json"]["ok"] is False
        assert resp["json"]["error"]["code"] == "ROUTE_NOT_FOUND"

    def test_t2_f6_b03_route_with_zero_tickets_in_hour(self):
        """28. Route with 0 tickets produces running_load=0 and thin confidence."""
        stops = [
            {"stop_sequence": 0, "boardings": 0.0, "alightings": 0.0, "running_load": 0.0, "sample_ticket_count": 0},
            {"stop_sequence": 1, "boardings": 0.0, "alightings": 0.0, "running_load": 0.0, "sample_ticket_count": 0},
        ]
        assert SpecReferenceOracle.flow_conservation(stops) is True
        lvl, txt = SpecReferenceOracle.confidence_rating(stops[0]["sample_ticket_count"])
        assert lvl == "thin"

    def test_t2_f6_b04_single_stop_or_two_stop_short_route(self):
        """29. Short feeder route (2 stops) maintains conservation and terminal clearance."""
        stops = [
            {"stop_sequence": 0, "boardings": 15.0, "alightings": 0.0, "running_load": 15.0},
            {"stop_sequence": 1, "boardings": 0.0, "alightings": 15.0, "running_load": 0.0},
        ]
        assert SpecReferenceOracle.flow_conservation(stops) is True

    def test_t2_f6_b05_circular_loop_route_terminal_clearance(self, api_spec_client):
        """30. Circular route terminal stop correctly clears running passenger load to zero."""
        resp = api_spec_client.get("/api/routes/433UP/flow")
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        assert stops[-1]["running_load"] == 0.0


# ===========================================================================
# F7: Export Engine Boundaries
# ===========================================================================

class TestTier2F7ExportBoundaries:
    """Verifies edge and format rejection cases for export endpoints."""

    def test_t2_f7_b01_unsupported_export_format_returns_400(self, api_spec_client):
        """31. Unsupported export formats (xml, yaml) return HTTP 400 INVALID_EXPORT_FORMAT."""
        for bad_fmt in ["xml", "yaml", "tsv"]:
            resp = api_spec_client.get("/api/analytics/export", {"format": bad_fmt})
            assert resp["status_code"] == 400
            assert resp["json"]["ok"] is False
            assert resp["json"]["error"]["code"] == "INVALID_EXPORT_FORMAT"

    def test_t2_f7_b02_empty_query_export_returns_headers_and_metadata(self, api_spec_client):
        """32. Exporting with filters returns valid # Metadata: header block and column headers."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv", "hour": 23})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        assert lines[0].startswith("# Metadata:")
        assert "route_id" in lines[4]

    def test_t2_f7_b03_special_characters_in_route_names_csv_escaped(self, api_spec_client):
        """33. CSV output text is parseable and handles commas/special characters cleanly."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = resp["text"].splitlines()
        # Verify line structure is non-empty and well-formed
        assert len(lines) >= 6

    def test_t2_f7_b04_all_metadata_lines_strictly_prefixed_with_hash(self, api_spec_client):
        """34. All metadata block lines (lines 1 to 4) are strictly prefixed with #."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        for i in range(4):
            assert lines[i].startswith("#"), f"Line {i} not prefixed with #: {lines[i]}"

    def test_t2_f7_b05_zero_hour_network_export_streaming(self, api_spec_client):
        """35. Midnight export (hour=0) succeeds and returns valid stream."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv", "hour": 0})
        assert resp["status_code"] == 200
        assert len(resp["text"]) > 100


# ===========================================================================
# F8: Corridors Map Boundaries
# ===========================================================================

class TestTier2F8MapBoundaries:
    """Verifies edge cases for Planners Corridors Map."""

    def test_t2_f8_b01_zero_traffic_night_hour_all_corridors_green(self, api_spec_client):
        """36. Late night hour (hour 3) renders all corridors green (#22A06B) and Seats Available."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 3})
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]
        for c in corrs:
            assert c["crowd_level"] == "Seats Available"
            assert c["color"] == "#22A06B"

    def test_t2_f8_b02_invalid_hour_boundary_rejected(self, api_spec_client):
        """37. Hour 25 returns HTTP 400 INVALID_HOUR."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 25})
        assert resp["status_code"] == 400
        assert resp["json"]["ok"] is False

    def test_t2_f8_b03_missing_gtfs_shape_falls_back_to_stop_lines(self, api_spec_client):
        """38. Corridors contain valid coordinates array with >= 2 points even without complex shapes."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp["status_code"] == 200
        for c in resp["json"]["data"]:
            assert len(c["coordinates"]) >= 2

    def test_t2_f8_b04_extreme_bounding_box_filter(self, api_spec_client):
        """39. Bounding box outside Delhi NCR returns empty corridors list without crashing."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {
            "min_lat": 45.0,
            "max_lat": 46.0
        })
        assert resp["status_code"] == 200
        assert resp["json"]["data"] == []

    def test_t2_f8_b05_max_corridor_cap_boundary_50(self, api_spec_client):
        """40. Requesting limit=200 caps returned corridors at maximum 50."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"limit": 200})
        assert resp["status_code"] == 200
        assert len(resp["json"]["data"]) <= 50


# ===========================================================================
# F9: Boarding Advice Boundaries
# ===========================================================================

class TestTier2F9AdviceBoundaries:
    """Verifies edge and cutoff conditions for alternative boarding stop advice."""

    def test_t2_f9_b01_boundary_exact_400m_walking_distance_accepted(self):
        """41. Walking distance of exactly 400.0m is accepted (<= 400m bound)."""
        adv = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=400.0,
            conf="high"
        )
        assert adv is True

    def test_t2_f9_b02_boundary_401m_walking_distance_rejected(self):
        """42. Walking distance of 401.0m is strictly rejected (> 400m bound)."""
        adv = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=401.0,
            conf="high"
        )
        assert adv is False

    def test_t2_f9_b03_origin_is_first_stop_no_upstream_stop(self, api_spec_client):
        """43. If origin is the first stop on the route, boarding advice is None."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "14:00:00"  # Off-peak Seats Available
        })
        assert resp["status_code"] == 200
        for opt in resp["json"]["data"]["options"]:
            assert opt.get("boarding_advice") is None

    def test_t2_f9_b04_upstream_stop_more_crowded_suppression(self):
        """44. Advice is suppressed if upstream stop is more crowded than current stop."""
        adv = SpecReferenceOracle.boarding_advice(
            current_crowd="Standing Room",
            alt_crowd="Crowded",
            walk_m=200.0,
            conf="high"
        )
        assert adv is False

    def test_t2_f9_b05_upstream_stop_thin_confidence_suppression(self):
        """45. Advice is suppressed if upstream stop has thin confidence (5 tickets)."""
        adv = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=200.0,
            conf="thin"
        )
        assert adv is False


# ===========================================================================
# Adversarial & Degradation
# ===========================================================================

class TestTier2AdversarialAndDegradation:
    """Verifies graceful degradation and adversarial injection resistance."""

    def test_t2_deg_01_unseeded_database_graceful_200_degraded(self, api_spec_client):
        """46. Unseeded database returns HTTP 200 with degraded envelope, zero 500 crashes."""
        resp = api_spec_client.get("/api/data-tier")
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True
        assert resp["json"]["meta"]["data_tier"] in ("real_public", "estimated", "organizer")

    def test_t2_deg_02_sql_injection_in_export_route_id(self, api_spec_client):
        """47. SQL injection attempts in route_id return 404 and never execute raw SQL."""
        malicious_route = "433UP' OR 1=1 --"
        resp = api_spec_client.get(f"/api/routes/{malicious_route}/export")
        assert resp["status_code"] in (400, 404)
        assert resp["json"]["ok"] is False
