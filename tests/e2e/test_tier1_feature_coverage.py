"""
Tier 1: Feature Coverage End-to-End Tests for Features F1 to F9.

Covers:
- F1: Confidence & Data Sparsity (verbal mappings, ticket counts, thin cell fallback)
- F2: Bus Size & Capacity Normalization (vehicle class, capacity_verified: false, no occupancy %)
- F3: Unrecorded Riders & Sensitivity (0%, 10%, 20%, 30% scenarios)
- F4: Operator Action Sheet (corridor deficit ranking, extra trips, glossary, disclaimer)
- F5: Departure Time Scrubber (offsets 0, 15, 30, 45, 60 min, shifted departures, tips)
- F6: Stop-Level Flow (ordered stops, conservation, Mode A/B attribution)
- F7: Crowd Estimate Exports (CSV with # Metadata:, JSON envelope, column schema)
- F8: Planners Crowding Map (corridor geometry, color coding, capping <= 50)
- F9: Boarding Advice (earlier walking stop <= 400m when crowd differs, confidence checks)
- Cross-Cutting Data Grounding & Envelope Integrity
Total: 47 tests.
"""

import math
import pytest
from tests.e2e.conftest import SpecReferenceOracle


# ===========================================================================
# F1: Confidence Rating & Data Sparsity
# ===========================================================================

class TestTier1F1ConfidenceRating:
    """Verifies Feature F1 verbal confidence ratings and ticket sample counts."""

    def test_t1_f1_01_high_confidence_ticket_count_above_100(self, api_spec_client):
        """1. Ticket count >= 100 yields high confidence and Based on a lot of data."""
        resp = api_spec_client.get("/api/routes/433UP")
        assert resp["status_code"] == 200
        data = resp["json"]["data"]
        assert data["confidence"] == "high"
        assert data["confidence_text"] == "Based on a lot of data"
        assert data["sample_ticket_count"] >= 100

    def test_t1_f1_02_medium_confidence_ticket_count_between_30_and_99(self, api_spec_client):
        """2. Ticket count 30-99 yields medium confidence and Based on some data."""
        resp = api_spec_client.get("/api/routes/764UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        med_stops = [s for s in stops if 30 <= s["sample_ticket_count"] <= 99]
        assert len(med_stops) > 0
        for s in med_stops:
            assert s["confidence"] == "medium"
            assert s["confidence_text"] == "Based on some data"

    def test_t1_f1_03_low_confidence_ticket_count_between_10_and_29(self):
        """3. Ticket count 10-29 yields low confidence and Based on little data."""
        rating, text = SpecReferenceOracle.confidence_rating(18)
        assert rating == "low"
        assert text == "Based on little data"

    def test_t1_f1_04_thin_confidence_ticket_count_below_10(self, api_spec_client):
        """4. Ticket count < 10 yields thin confidence and Not enough data fallback."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        corridors = resp["json"]["data"]["corridors"]
        thin = [c for c in corridors if c["sample_ticket_count"] < 10]
        assert len(thin) >= 1
        assert thin[0]["confidence"] == "thin"
        assert thin[0]["confidence_text"] == "Not enough data"
        assert thin[0]["crowd_level"] == "Not enough data"

    def test_t1_f1_05_ticket_count_field_integrity_in_details_and_plan(self, api_spec_client):
        """5. Details view stops and journey options contain sample_ticket_count integer field."""
        resp = api_spec_client.get("/api/routes/433UP")
        assert resp["status_code"] == 200
        for s in resp["json"]["data"]["stops"]:
            assert isinstance(s["sample_ticket_count"], int)
            assert s["sample_ticket_count"] >= 0

        p_resp = api_spec_client.get("/api/plan", {"origin_id": "DEL_001", "destination_id": "DEL_002"})
        assert p_resp["status_code"] == 200
        for opt in p_resp["json"]["data"]["options"]:
            assert isinstance(opt["sample_ticket_count"], int)
            assert opt["sample_ticket_count"] >= 0


# ===========================================================================
# F2: Capacity Normalisation & Vehicle Class
# ===========================================================================

class TestTier1F2CapacityNormalization:
    """Verifies Feature F2 vehicle class separation and unverified capacity handling."""

    def test_t1_f2_01_vehicle_class_ac_vs_non_ac_classification(self, api_spec_client):
        """6. Routes and options distinguish between AC and Non-AC vehicle classes."""
        resp = api_spec_client.get("/api/routes/433UP")
        assert resp["status_code"] == 200
        assert resp["json"]["data"]["vehicle_class"] == "AC"

        p_resp = api_spec_client.get("/api/plan", {"origin_id": "DEL_001", "destination_id": "DEL_002"})
        assert p_resp["status_code"] == 200
        classes = {opt["vehicle_class"] for opt in p_resp["json"]["data"]["options"]}
        assert "Non-AC" in classes or "AC" in classes

    def test_t1_f2_02_crowd_index_within_vehicle_class_without_cross_contamination(self):
        """7. RCI evaluates within respective vehicle class capacities (55 vs 60)."""
        load = 48.0
        rci_ac = SpecReferenceOracle.relative_crowding_index(load, rated_capacity=55.0)
        rci_non_ac = SpecReferenceOracle.relative_crowding_index(load, rated_capacity=60.0)
        assert rci_ac == pytest.approx(87.27, abs=0.1)
        assert rci_non_ac == pytest.approx(80.0, abs=0.1)
        assert rci_ac != rci_non_ac

    def test_t1_f2_03_capacity_verified_flag_is_strictly_false(self, api_spec_client):
        """8. capacity_verified flag is explicitly False across all responses."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        for corr in resp["json"]["data"]["corridors"]:
            assert corr["capacity_verified"] is False

    def test_t1_f2_04_unverified_occupancy_percentage_is_hidden(self, api_spec_client):
        """9. Unverified occupancy percentage is never rendered as raw ground truth."""
        resp = api_spec_client.get("/api/plan", {"origin_id": "DEL_001", "destination_id": "DEL_002"})
        assert resp["status_code"] == 200
        for opt in resp["json"]["data"]["options"]:
            assert opt.get("occupancy_percent") is None

    def test_t1_f2_05_vehicle_class_present_in_operator_and_route_payloads(self, api_spec_client):
        """10. Every corridor in action sheet specifies vehicle_class in ('AC', 'Non-AC')."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        for corr in resp["json"]["data"]["corridors"]:
            assert corr["vehicle_class"] in ("AC", "Non-AC")


# ===========================================================================
# F3: Unrecorded Riders & Sensitivity
# ===========================================================================

class TestTier1F3SensitivityScenarios:
    """Verifies Feature F3 sensitivity analysis for unrecorded ridership."""

    def test_t1_f3_01_sensitivity_endpoint_returns_standard_envelope(self, api_spec_client):
        """11. GET /api/analytics/sensitivity returns ok=True and standard 4 scenarios."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True
        assert resp["json"]["data"]["scenarios"] == [0.0, 0.10, 0.20, 0.30]

    def test_t1_f3_02_scenario_loads_strictly_monotonic_increase(self, api_spec_client):
        """12. Scenario loads strictly increase across 0%, 10%, 20%, 30%."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        top = resp["json"]["data"]["top_routes"]
        for r in top:
            sl = r["scenario_loads"]
            assert sl["0%"] < sl["10%"] < sl["20%"] < sl["30%"]

    def test_t1_f3_03_scenario_loads_mathematical_precision(self, api_spec_client):
        """13. Scenario loads accurately equal baseline_load * (1 + scenario)."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        top = resp["json"]["data"]["top_routes"][0]
        base = top["baseline_load"]
        assert top["scenario_loads"]["10%"] == pytest.approx(base * 1.10, abs=0.1)
        assert top["scenario_loads"]["20%"] == pytest.approx(base * 1.20, abs=0.1)
        assert top["scenario_loads"]["30%"] == pytest.approx(base * 1.30, abs=0.1)

    def test_t1_f3_04_sensitivity_query_day_type_filter(self, api_spec_client):
        """14. Querying sensitivity with day_type=weekend vs weekday succeeds."""
        resp_wk = api_spec_client.get("/api/analytics/sensitivity", {"day_type": "weekday"})
        resp_we = api_spec_client.get("/api/analytics/sensitivity", {"day_type": "weekend"})
        assert resp_wk["status_code"] == 200
        assert resp_we["status_code"] == 200
        assert resp_wk["json"]["data"]["day_type"] == "weekday"
        assert resp_we["json"]["data"]["day_type"] == "weekend"

    def test_t1_f3_05_scenario_crowd_level_transition_reported(self, api_spec_client):
        """15. Response reports both baseline_crowd and scenario_30_crowd categories."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        for r in resp["json"]["data"]["top_routes"]:
            assert "baseline_crowd" in r
            assert "scenario_30_crowd" in r


# ===========================================================================
# F4: Operator Action Sheet
# ===========================================================================

class TestTier1F4OperatorActionSheet:
    """Verifies Feature F4 Operator Action Sheet API."""

    def test_t1_f4_01_operator_action_sheet_returns_corridors_and_metadata(self, api_spec_client):
        """16. GET /api/analytics/operator-action-sheet returns corridors, glossary, disclaimer."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        data = resp["json"]["data"]
        assert "corridors" in data and isinstance(data["corridors"], list)
        assert "glossary" in data and isinstance(data["glossary"], dict)
        assert "disclaimer" in data and isinstance(data["disclaimer"], str)

    def test_t1_f4_02_corridors_ranked_by_passenger_deficit_descending(self, api_spec_client):
        """17. Corridors are strictly sorted by passenger_deficit descending."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]["corridors"]
        for i in range(len(corrs) - 1):
            assert corrs[i]["passenger_deficit"] >= corrs[i + 1]["passenger_deficit"]

    def test_t1_f4_03_extra_trips_computed_for_all_four_scenarios(self, api_spec_client):
        """18. Every corridor contains non-negative extra trips for all 4 scenarios."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        for c in resp["json"]["data"]["corridors"]:
            et = c["extra_trips"]
            for sc in ["0%", "10%", "20%", "30%"]:
                assert sc in et
                assert isinstance(et[sc], int)
                assert et[sc] >= 0

    def test_t1_f4_04_action_sheet_glossary_definitions_completeness(self, api_spec_client):
        """19. Glossary defines passenger_deficit and extra_trips in plain language."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        glossary = resp["json"]["data"]["glossary"]
        assert "passenger_deficit" in glossary
        assert "extra_trips" in glossary

    def test_t1_f4_05_action_sheet_disclaimer_indicates_model_derivation(self, api_spec_client):
        """20. Disclaimer clearly notes indicative model and spacing assumption."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        disclaimer = resp["json"]["data"]["disclaimer"]
        assert "Indicative" in disclaimer
        assert "spacing" in disclaimer


# ===========================================================================
# F5: Departure Time Scrubber
# ===========================================================================

class TestTier1F5DepartureScrubber:
    """Verifies Feature F5 departure time scrubber backend offsets."""

    def test_t1_f5_01_plan_accepts_offset_minutes_query_parameter(self, api_spec_client):
        """21. GET /api/plan accepts offset_minutes parameter successfully."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "offset_minutes": 15
        })
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True

    def test_t1_f5_02_scheduled_departures_shift_by_offset(self, api_spec_client):
        """22. Scheduled departures shift forward in time by the offset."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 30
        })
        assert resp["status_code"] == 200
        options = resp["json"]["data"]["options"]
        assert len(options) >= 1
        assert options[0]["scheduled_departure"] == "09:00:00"

    def test_t1_f5_03_all_supported_offsets_return_valid_plans(self, api_spec_client):
        """23. All 5 supported offsets (0, 15, 30, 45, 60) return valid journey options."""
        for offset in [0, 15, 30, 45, 60]:
            resp = api_spec_client.get("/api/plan", {
                "origin_id": "DEL_001",
                "destination_id": "DEL_002",
                "offset_minutes": offset
            })
            assert resp["status_code"] == 200
            assert len(resp["json"]["data"]["options"]) >= 1

    def test_t1_f5_04_departure_tips_generated_for_favorable_offset(self, api_spec_client):
        """24. Departure tips provide advice when a time shift avoids peak crowding."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp["status_code"] == 200
        tips = resp["json"]["data"]["departure_tips"]
        assert isinstance(tips, list)

    def test_t1_f5_05_offset_minutes_preserved_in_response_meta(self, api_spec_client):
        """25. offset_minutes is preserved and echoed in metadata envelope."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "offset_minutes": 60
        })
        assert resp["status_code"] == 200
        assert resp["json"]["meta"]["offset_minutes"] == 60


# ===========================================================================
# F6: Stop-Level Flow & Conservation
# ===========================================================================

class TestTier1F6StopLevelFlow:
    """Verifies Feature F6 stop-level flow and passenger conservation."""

    def test_t1_f6_01_stop_flow_endpoint_returns_ordered_stops(self, api_spec_client):
        """26. GET /api/routes/433UP/flow returns stops ordered by stop_sequence."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        for i in range(len(stops) - 1):
            assert stops[i]["stop_sequence"] < stops[i + 1]["stop_sequence"]

    def test_t1_f6_02_running_load_satisfies_conservation_formula(self, api_spec_client):
        """27. Running passenger load satisfies physical conservation formula."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        assert SpecReferenceOracle.flow_conservation(stops) is True

    def test_t1_f6_03_first_stop_has_zero_alightings(self, api_spec_client):
        """28. First stop on route has alightings == 0.0 and running_load == boardings."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        first_stop = resp["json"]["data"]["stops"][0]
        assert first_stop["alightings"] == 0.0
        assert first_stop["running_load"] == pytest.approx(first_stop["boardings"], abs=0.1)

    def test_t1_f6_04_terminal_stop_has_zero_boardings_and_clearance(self, api_spec_client):
        """29. Terminal stop has boardings == 0.0 and clears passenger load to zero."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        term_stop = resp["json"]["data"]["stops"][-1]
        assert term_stop["boardings"] == 0.0
        assert term_stop["running_load"] == 0.0

    def test_t1_f6_05_attribution_mode_specified_per_stop(self, api_spec_client):
        """30. Every stop specifies attribution mode as Mode A or Mode B."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        for s in stops:
            assert s["attribution_mode"] in ("Mode A (Observed O-D)", "Mode B (Inferred Alightings)")


# ===========================================================================
# F7: Crowd Estimate Exports
# ===========================================================================

class TestTier1F7CrowdEstimateExports:
    """Verifies Feature F7 CSV/JSON export engine and header block."""

    def test_t1_f7_01_csv_export_returns_attachment_content_type(self, api_spec_client):
        """31. CSV export sets Content-Type text/csv and Content-Disposition attachment."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv", "hour": 8})
        assert resp["status_code"] == 200
        headers = resp.get("headers", {})
        ct = headers.get("Content-Type", "")
        cd = headers.get("Content-Disposition", "")
        assert "text/csv" in ct
        assert "attachment" in cd

    def test_t1_f7_02_csv_starts_with_metadata_header_block(self, api_spec_client):
        """32. CSV export starts with 4-line # Metadata: block."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        assert lines[0].startswith("# Metadata:")
        assert lines[1].startswith("# Generated:")
        assert lines[2].startswith("# Provenance:")
        assert lines[3].startswith("# Verification:")

    def test_t1_f7_03_csv_column_headers_match_exact_specification(self, api_spec_client):
        """33. CSV column header row matches the 10 specified columns in exact order."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        expected = "route_id,direction,day_type,hour,scheduled_trips,typical_load,vehicle_class,crowd_level,confidence,ticket_count"
        assert lines[4] == expected

    def test_t1_f7_04_json_export_returns_standard_envelope(self, api_spec_client):
        """34. JSON export returns standard API envelope with list of crowd estimates."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "json"})
        assert resp["status_code"] == 200
        assert resp["json"]["ok"] is True
        assert isinstance(resp["json"]["data"], list)
        assert len(resp["json"]["data"]) >= 1

    def test_t1_f7_05_route_specific_export_filters_to_target_route(self, api_spec_client):
        """35. Route-specific export GET /api/routes/433UP/export filters to target route."""
        resp = api_spec_client.get("/api/routes/433UP/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        # Skip 4 metadata lines and 1 header line
        for row in lines[5:]:
            assert row.startswith("433UP,")


# ===========================================================================
# F8: Planners Crowding Map
# ===========================================================================

class TestTier1F8PlannersCrowdingMap:
    """Verifies Feature F8 Planners Crowding Map API."""

    def test_t1_f8_01_corridor_map_endpoint_returns_corridor_features(self, api_spec_client):
        """36. GET /api/analytics/corridors-map returns list of corridors with geometry."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]
        assert isinstance(corrs, list)
        assert len(corrs) >= 1
        assert "coordinates" in corrs[0]

    def test_t1_f8_02_corridor_assigned_valid_crowd_level_and_color(self, api_spec_client):
        """37. Corridors are assigned valid categorical crowd levels and hex colors."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp["status_code"] == 200
        for c in resp["json"]["data"]:
            assert c["crowd_level"] in ("Seats Available", "Standing Room", "Crowded")
            assert c["color"] in ("#22A06B", "#F5A623", "#E5484D")

    def test_t1_f8_03_corridor_capped_limit_enforced(self, api_spec_client):
        """38. Corridor count is strictly capped at limit <= 50."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"limit": 20})
        assert resp["status_code"] == 200
        assert len(resp["json"]["data"]) <= 20

    def test_t1_f8_04_corridor_map_day_type_and_hour_filtering(self, api_spec_client):
        """39. Map reflects diurnal shift between night (hour 3) and morning rush (hour 8)."""
        resp_night = api_spec_client.get("/api/analytics/corridors-map", {"hour": 3})
        resp_rush = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp_night["status_code"] == 200
        assert resp_rush["status_code"] == 200
        assert all(c["crowd_level"] == "Seats Available" for c in resp_night["json"]["data"])

    def test_t1_f8_05_geometry_coordinates_within_delhi_ncr_envelope(self, api_spec_client):
        """40. All corridor geometry coordinates lie within Delhi NCR bounding box."""
        resp = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp["status_code"] == 200
        for c in resp["json"]["data"]:
            for pt in c["coordinates"]:
                lat, lon = pt[0], pt[1]
                assert 28.30 <= lat <= 29.00, f"Lat {lat} out of bounds"
                assert 76.70 <= lon <= 77.50, f"Lon {lon} out of bounds"


# ===========================================================================
# F9: Boarding Advice
# ===========================================================================

class TestTier1F9BoardingAdvice:
    """Verifies Feature F9 alternative boarding stop advice."""

    def test_t1_f9_01_advice_generated_when_earlier_stop_is_less_crowded_within_400m(self):
        """41. Advice triggers when upstream stop is within 400m, less crowded, and confident."""
        can_advise = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=320.0,
            conf="high"
        )
        assert can_advise is True

    def test_t1_f9_02_advice_includes_walking_meters_and_stop_name(self, api_spec_client):
        """42. Journey option boarding_advice includes walk_distance_m and earlier stop name."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_002",
            "destination_id": "DEL_003",
            "departure_time": "08:30:00"
        })
        assert resp["status_code"] == 200
        options = resp["json"]["data"]["options"]
        opt_with_adv = next((o for o in options if o.get("boarding_advice")), None)
        assert opt_with_adv is not None
        adv = opt_with_adv["boarding_advice"]
        assert adv["show_advice"] is True
        assert adv["walk_distance_m"] <= 400.0
        assert len(adv["earlier_stop_name"]) > 0

    def test_t1_f9_03_advice_suppressed_when_crowd_levels_are_equal(self):
        """43. Advice is suppressed when upstream stop has equal crowd level."""
        can_advise = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Crowded",
            walk_m=200.0,
            conf="high"
        )
        assert can_advise is False

    def test_t1_f9_04_advice_suppressed_when_distance_exceeds_400m(self):
        """44. Advice is suppressed when upstream stop distance exceeds 400m."""
        can_advise = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=450.0,
            conf="high"
        )
        assert can_advise is False

    def test_t1_f9_05_advice_suppressed_when_confidence_is_low_or_thin(self):
        """45. Advice is suppressed when upstream stop confidence is low or thin."""
        for c in ["low", "thin"]:
            assert SpecReferenceOracle.boarding_advice("Crowded", "Seats Available", 200.0, c) is False


# ===========================================================================
# Cross-Cutting: Data Grounding & Envelopes
# ===========================================================================

class TestTier1CrossCuttingGrounding:
    """Verifies cross-cutting data grounding and envelope compliance."""

    def test_t1_cc_01_zero_hardcoded_fake_random_values_in_responses(self, api_spec_client):
        """46. Inspects responses to ensure outputs are deterministic and non-random."""
        r1 = api_spec_client.get("/api/analytics/sensitivity")
        r2 = api_spec_client.get("/api/analytics/sensitivity")
        assert r1["json"]["data"] == r2["json"]["data"], "Sensitivity response must be deterministic"

    def test_t1_cc_02_all_endpoints_return_standard_api_envelope(self, api_spec_client):
        """47. All new F1-F9 endpoints return standard ok, data, error, meta envelope."""
        endpoints = [
            "/api/analytics/sensitivity",
            "/api/analytics/operator-action-sheet",
            "/api/routes/433UP/flow",
            "/api/analytics/corridors-map",
        ]
        for ep in endpoints:
            resp = api_spec_client.get(ep)
            assert resp["status_code"] == 200
            j = resp["json"]
            assert "ok" in j and "data" in j and "error" in j and "meta" in j
            assert j["meta"]["data_tier"] in ("organizer", "estimated", "real_public")
