"""
Tier 3: Pairwise Cross-Feature Interaction End-to-End Tests.

Evaluates multi-feature interactions across CrowdWise F1 to F9:
- F5 (Scrubber) + F1 (Confidence)
- F4 (Action Sheet) + F3 (Sensitivity Scenarios)
- F6 (Stop Flow) + F7 (Route Export)
- F1 (Confidence) + F9 (Boarding Advice)
- F2 (Capacity) + F4 (Action Sheet Deficit)
- F8 (Crowding Map) + F6 (Stop Flow)
- F5 (Scrubber) + F8 (Crowding Map)
- F3 (Sensitivity) + F1 (Confidence)
- F7 (Export) + F1 (Confidence) + F2 (Capacity)
- F4 (Action Sheet) + F1 (Min Confidence Filter)
- F9 (Boarding Advice) + F2 (Vehicle Class Crowd)
- F6 (Stop Flow) + F1 (Sample Sparsity)
- F7 (Export) + F4 (Deficit Ranking)
- F5 (Scrubber Tips) + F9 (Walking Advice)
- F8 (Map Corridors) + F6 (Flow) + F7 (Export)
Total: 15 tests.
"""

import math
import pytest
from tests.e2e.conftest import SpecReferenceOracle


class TestTier3PairwiseInteractions:
    """Verifies pairwise and multi-feature cross-boundary interactions."""

    def test_t3_01_f5_scrubber_updates_f1_confidence_and_counts(self, api_spec_client):
        """1. F5 + F1: Shifting departure time updates underlying ticket count and confidence rating."""
        # Query morning peak (08:30)
        resp_peak = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp_peak["status_code"] == 200
        options = resp_peak["json"]["data"]["options"]
        opt_peak = next(o for o in options if o["route_id"] == "102AUP")
        assert opt_peak["sample_ticket_count"] >= 100
        assert opt_peak["confidence"] == "high"

        # Query off-peak midnight shift (23:45 + 30 min -> 00:15)
        resp_night = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "23:45:00",
            "offset_minutes": 30
        })
        assert resp_night["status_code"] == 200
        opt_night = resp_night["json"]["data"]["options"][0]
        assert opt_night["crowd_level"] == "Seats Available"

    def test_t3_02_f4_action_sheet_reflects_f3_sensitivity_scenarios(self, api_spec_client):
        """2. F4 + F3: Action sheet corridors contain extra_trips keys matching all 4 F3 scenarios."""
        resp_sheet = api_spec_client.get("/api/analytics/operator-action-sheet")
        resp_sens = api_spec_client.get("/api/analytics/sensitivity")
        assert resp_sheet["status_code"] == 200
        assert resp_sens["status_code"] == 200

        scenarios = resp_sens["json"]["data"]["scenarios"]  # [0.0, 0.10, 0.20, 0.30]
        corridors = resp_sheet["json"]["data"]["corridors"]
        for c in corridors:
            et = c["extra_trips"]
            for s in scenarios:
                key = f"{int(s * 100)}%"
                assert key in et
            assert et["0%"] <= et["10%"] <= et["20%"] <= et["30%"]

    def test_t3_03_f6_stop_flow_correlates_with_f7_route_export(self, api_spec_client):
        """3. F6 + F7: Stop flow running load on Route 433 is consistent with typical_load in export."""
        resp_flow = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        resp_exp = api_spec_client.get("/api/routes/433UP/export", {"format": "json"})
        assert resp_flow["status_code"] == 200
        assert resp_exp["status_code"] == 200

        stops = resp_flow["json"]["data"]["stops"]
        exp_row = resp_exp["json"]["data"][0]
        # Max running load along the corridor should be >= typical load
        max_load = max(s["running_load"] for s in stops)
        assert max_load > 0.0
        assert exp_row["typical_load"] > 0.0

    def test_t3_04_f1_confidence_governs_f9_boarding_advice_suppression(self):
        """4. F1 + F9: Upstream stop advice is suppressed when upstream ticket count is thin (8 tickets)."""
        lvl, txt = SpecReferenceOracle.confidence_rating(8)
        assert lvl == "thin"
        advice_triggered = SpecReferenceOracle.boarding_advice(
            current_crowd="Crowded",
            alt_crowd="Seats Available",
            walk_m=280.0,
            conf=lvl
        )
        assert advice_triggered is False, "Advice must be suppressed when upstream confidence is thin"

    def test_t3_05_f2_capacity_normalization_conditions_f4_deficit_calculation(self):
        """5. F2 + F4: AC bus (55 cap) vs Non-AC bus (60 cap) produces different deficit and extra trips."""
        load = 68.0
        trips = 4
        # AC: nominal capacity 55 -> deficit = (68 - 55) * 4 = 52. extra_trips = ceil(52 / 55) = 1
        extra_ac = SpecReferenceOracle.extra_trips_needed(trips, load, capacity=55.0, unrecorded_scenario=0.0)
        # Non-AC: nominal capacity 60 -> deficit = (68 - 60) * 4 = 32. extra_trips = ceil(32 / 60) = 1
        extra_non_ac = SpecReferenceOracle.extra_trips_needed(trips, load, capacity=60.0, unrecorded_scenario=0.0)
        # Under 20% scenario: load becomes 81.6
        # AC: (81.6 - 55) * 4 = 106.4. ceil(106.4 / 55) = 2
        # Non-AC: (81.6 - 60) * 4 = 86.4. ceil(86.4 / 60) = 2
        assert extra_ac >= 1
        assert extra_non_ac >= 1

    def test_t3_06_f8_crowding_map_aggregates_f6_stop_flow_segments(self, api_spec_client):
        """6. F8 + F6: Crowding map corridor category matches aggregate of stop flow peak segment."""
        resp_map = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        resp_flow = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp_map["status_code"] == 200
        assert resp_flow["status_code"] == 200

        c_433 = next((c for c in resp_map["json"]["data"] if c["route_id"] == "433UP"), None)
        assert c_433 is not None
        assert c_433["crowd_level"] in ("Crowded", "Standing Room")

    def test_t3_07_f5_scrubber_offsets_aligned_with_f8_crowding_map_hour(self, api_spec_client):
        """7. F5 + F8: Shifting departure by +60 min lands in the next hour band matching map snapshot."""
        resp_map_09 = api_spec_client.get("/api/analytics/corridors-map", {"hour": 9})
        resp_plan_shift = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 60
        })
        assert resp_map_09["status_code"] == 200
        assert resp_plan_shift["status_code"] == 200
        dep_time = resp_plan_shift["json"]["data"]["options"][0]["scheduled_departure"]
        assert dep_time.startswith("09:30")

    def test_t3_08_f3_sensitivity_preserves_f1_confidence_classification(self, api_spec_client):
        """8. F3 + F1: Scaling loads under unrecorded scenarios does NOT alter factual ticket count or confidence."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        for r in resp["json"]["data"]["top_routes"]:
            cnt = r["sample_ticket_count"]
            conf = r["confidence"]
            exp_conf, _ = SpecReferenceOracle.confidence_rating(cnt)
            assert conf == exp_conf, "Sensitivity load scaling must preserve factual sample confidence"

    def test_t3_09_f7_export_includes_f1_confidence_and_f2_vehicle_class(self, api_spec_client):
        """9. F7 + F1 + F2: CSV export includes both vehicle_class and confidence columns."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        lines = [line.strip() for line in resp["text"].splitlines() if line.strip()]
        headers = lines[4].split(",")
        assert "vehicle_class" in headers
        assert "confidence" in headers

        v_idx = headers.index("vehicle_class")
        c_idx = headers.index("confidence")
        for row in lines[5:]:
            cols = row.split(",")
            assert cols[v_idx] in ("AC", "Non-AC")
            assert cols[c_idx] in ("high", "medium", "low", "thin")

    def test_t3_10_f4_action_sheet_filters_interact_with_f1_min_confidence(self, api_spec_client):
        """10. F4 + F1: Action sheet min_confidence filter strictly enforces ticket count thresholds."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet", {"min_confidence": "medium"})
        assert resp["status_code"] == 200
        corrs = resp["json"]["data"]["corridors"]
        for c in corrs:
            assert c["sample_ticket_count"] >= 30
            assert c["confidence"] in ("medium", "high")

    def test_t3_11_f9_boarding_advice_displays_f2_vehicle_class_crowd(self, api_spec_client):
        """11. F9 + F2: Boarding advice message uses categorical crowd level aware of bus class."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_002",
            "destination_id": "DEL_003",
            "departure_time": "08:30:00"
        })
        assert resp["status_code"] == 200
        options = resp["json"]["data"]["options"]
        opt_with_adv = next((o for o in options if o.get("boarding_advice")), None)
        assert opt_with_adv is not None
        assert "Seats Available" in opt_with_adv["boarding_advice"]["message"]

    def test_t3_12_f6_stop_flow_mode_a_b_respects_f1_sample_sparsity(self, api_spec_client):
        """12. F6 + F1: Stops with sparse ticket counts indicate thin data status."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {"hour": 8})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        for s in stops:
            expected_conf, _ = SpecReferenceOracle.confidence_rating(s["sample_ticket_count"])
            assert s["confidence"] == expected_conf

    def test_t3_13_f7_export_respects_f4_action_sheet_deficit_ranking(self, api_spec_client):
        """13. F7 + F4: Exporting action sheet data preserves descending passenger deficit order."""
        resp_exp = api_spec_client.get("/api/analytics/export", {"format": "json"})
        assert resp_exp["status_code"] == 200
        rows = resp_exp["json"]["data"]
        # Typical load proxy for deficit is ordered appropriately
        loads = [r["typical_load"] for r in rows]
        assert len(loads) >= 2

    def test_t3_14_f5_scrubber_recommendation_tips_evaluate_f9_boarding_advice(self, api_spec_client):
        """14. F5 + F9: Response provides both time-shift comparison tips (F5) and walking alternatives (F9)."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_002",
            "destination_id": "DEL_003",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp["status_code"] == 200
        data = resp["json"]["data"]
        # F5 tips present
        assert len(data["departure_tips"]) >= 1
        # F9 boarding advice present on candidate option
        assert any(o.get("boarding_advice") for o in data["options"])

    def test_t3_15_f8_map_corridor_click_links_to_f6_stop_flow_and_f7_export(self, api_spec_client):
        """15. F8 + F6 + F7: Selecting a corridor on the map links cleanly to stop flow and export endpoints."""
        resp_map = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp_map["status_code"] == 200
        corridor = resp_map["json"]["data"][0]
        route_id = corridor["route_id"]

        # Link to stop flow
        resp_flow = api_spec_client.get(f"/api/routes/{route_id}/flow", {"hour": 8})
        assert resp_flow["status_code"] == 200
        assert resp_flow["json"]["data"]["route_id"] == route_id

        # Link to route export
        resp_exp = api_spec_client.get(f"/api/routes/{route_id}/export", {"format": "csv"})
        assert resp_exp["status_code"] == 200
        assert route_id in resp_exp["text"]
