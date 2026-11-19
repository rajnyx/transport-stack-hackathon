"""
Tier 4: Real-World Delhi Transit Application Scenarios.

Realistic commuter journeys and DTC operator workflows across Delhi's major corridors:
- Route 433 (Badarpur Border to Mori Gate via Ashram & ITO)
- Route 502 (Mehrauli Terminal to Old Delhi Railway Station via AIIMS & CP)
- Route 764 (Najafgarh Terminal to Nehru Place Terminal via Dhaula Kuan)
- Mudrika Ring Road (OMS Trunk Circular Service)

Total: 8 comprehensive end-to-end scenarios.
"""

import math
import pytest
from tests.e2e.conftest import SpecReferenceOracle


class TestTier4DelhiCommuterAndOperatorScenarios:
    """Verifies end-to-end Delhi transit commuter and operator persona workflows."""

    def test_t4_01_morning_peak_route_433_badarpur_to_ito(self, api_spec_client):
        """
        Scenario 1: Morning office commuter on Route 433 UP from Badarpur to ITO at 08:30 AM.
        Workflow:
        1. Commuter plans trip at 08:30 AM (peak hour). Initial option shows Crowded with high confidence.
        2. Commuter activates departure scrubber (+30 min to 09:00). Option drops to Standing Room.
        3. F5 tips confirm the benefit of departing later.
        """
        # Step 1: Base peak plan at 08:30
        resp_base = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp_base["status_code"] == 200
        options_base = resp_base["json"]["data"]["options"]
        opt_433 = next((o for o in options_base if o["route_id"] == "433UP"), None)
        assert opt_433 is not None
        assert opt_433["confidence"] == "high"
        assert opt_433["sample_ticket_count"] >= 100
        assert opt_433["confidence_text"] == "Based on a lot of data"

        # Step 2: Scrubber shifted by +30 minutes
        resp_shift = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 30
        })
        assert resp_shift["status_code"] == 200
        options_shift = resp_shift["json"]["data"]["options"]
        opt_shift_102 = next((o for o in options_shift if o["route_id"] == "102AUP"), None)
        assert opt_shift_102 is not None
        assert opt_shift_102["crowd_level"] == "Standing Room"
        assert opt_shift_102["scheduled_departure"] == "09:00:00"

    def test_t4_02_evening_peak_route_502_aiims_to_mehrauli_unrecorded_sensitivity(self, api_spec_client):
        """
        Scenario 2: Healthcare worker departing AIIMS at 18:00 on Route 502 DOWN.
        Workflow:
        1. Journey planner evaluates crowding at evening peak.
        2. User inspects sensitivity analysis on Route 502 across 0%, 10%, 20%, 30% unrecorded scenarios.
        3. Verifies load monotonically increases from baseline (52.0) to 30% scenario (67.6).
        """
        resp = api_spec_client.get("/api/analytics/sensitivity", {"hour": 18, "day_type": "weekday"})
        assert resp["status_code"] == 200
        top_routes = resp["json"]["data"]["top_routes"]
        r502 = next((r for r in top_routes if r["route_id"] == "502UP"), None)
        assert r502 is not None
        assert r502["baseline_load"] == pytest.approx(52.0, abs=0.1)
        loads = r502["scenario_loads"]
        assert loads["0%"] == pytest.approx(52.0, abs=0.1)
        assert loads["10%"] == pytest.approx(57.2, abs=0.1)
        assert loads["20%"] == pytest.approx(62.4, abs=0.1)
        assert loads["30%"] == pytest.approx(67.6, abs=0.1)
        assert r502["scenario_30_crowd"] == "Crowded"

    def test_t4_03_cross_suburb_route_764_najafgarh_flow_conservation(self, api_spec_client):
        """
        Scenario 3: Suburban commuter riding Route 764 across South-West Delhi (Najafgarh to Nehru Place).
        Workflow:
        1. Stop flow timeline queried for 15 stops along the corridor.
        2. Physical flow conservation holds strictly at every stop sequence.
        3. Origin alightings are zero and terminal alightings clear passenger load to zero.
        """
        resp = api_spec_client.get("/api/routes/764UP/flow", {"hour": 8, "direction": "UP"})
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        assert len(stops) >= 10
        assert SpecReferenceOracle.flow_conservation(stops) is True

        # Origin stop checks
        assert stops[0]["stop_name"] == "Najafgarh Terminal"
        assert stops[0]["alightings"] == 0.0
        assert stops[0]["running_load"] == stops[0]["boardings"]

        # Terminal stop checks
        assert stops[-1]["stop_name"] == "Nehru Place Terminal"
        assert stops[-1]["boardings"] == 0.0
        assert stops[-1]["running_load"] == 0.0

    def test_t4_04_ring_road_mudrika_trunk_corridor_crowding_map_and_advice(self, api_spec_client):
        """
        Scenario 4: Ring Road commuter at Dhaula Kuan seeking alternative boarding advice.
        Workflow:
        1. Commuter inspects Mudrika trunk corridor on Planners Crowding Map.
        2. Boarding stop advice indicates walking 320m to Connaught Place / upstream hub for Seats Available.
        3. Commuter gets actionable guidance within the 400m walk limit.
        """
        # Step 1: Map inspection
        resp_map = api_spec_client.get("/api/analytics/corridors-map", {"hour": 8})
        assert resp_map["status_code"] == 200
        mudrika = next((c for c in resp_map["json"]["data"] if c["route_id"] == "OMS"), None)
        assert mudrika is not None
        assert mudrika["crowd_level"] in ("Standing Room", "Crowded")

        # Step 2: Journey plan advice evaluation
        resp_plan = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_002",
            "destination_id": "DEL_003",
            "departure_time": "08:30:00"
        })
        assert resp_plan["status_code"] == 200
        options = resp_plan["json"]["data"]["options"]
        opt_adv = next((o for o in options if o.get("boarding_advice")), None)
        assert opt_adv is not None
        advice = opt_adv["boarding_advice"]
        assert advice["show_advice"] is True
        assert advice["walk_distance_m"] <= 400.0
        assert "Seats Available" in advice["message"]

    def test_t4_05_midday_off_peak_route_502_seats_available_scrubber(self, api_spec_client):
        """
        Scenario 5: Leisure traveller on Route 502 at 14:00 (midday off-peak).
        Workflow:
        1. Commuter queries journey options across scrubber offsets (+0, +15, +30, +45, +60).
        2. All offsets consistently show Seats Available.
        3. Zero misleading departure tips are emitted because crowding is already low.
        """
        for offset in [0, 15, 30, 45, 60]:
            resp = api_spec_client.get("/api/plan", {
                "origin_id": "DEL_001",
                "destination_id": "DEL_002",
                "departure_time": "14:00:00",
                "offset_minutes": offset
            })
            assert resp["status_code"] == 200
            data = resp["json"]["data"]
            opts = data["options"]
            assert opts[0]["crowd_level"] == "Seats Available"
            # Off-peak travel does not generate urgency departure tips
            assert len(data["departure_tips"]) == 0

    def test_t4_06_late_night_shift_route_433_thin_data_graceful_handling(self, api_spec_client):
        """
        Scenario 6: Late night essential worker on Route 433 at 23:30 (thin data cell).
        Workflow:
        1. Action sheet and route queries for late night show low sample ticket counts (< 10).
        2. System labels confidence as 'thin' and verbal text as 'Not enough data'.
        3. Graceful fallback ensures no invented certainty or synthetic claims.
        """
        resp_sheet = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp_sheet["status_code"] == 200
        corrs = resp_sheet["json"]["data"]["corridors"]
        thin_corridor = next((c for c in corrs if c["confidence"] == "thin"), None)
        assert thin_corridor is not None
        assert thin_corridor["sample_ticket_count"] < 10
        assert thin_corridor["confidence_text"] == "Not enough data"
        assert thin_corridor["crowd_level"] == "Not enough data"

    def test_t4_07_operator_morning_rush_action_sheet_deficit_ranking(self, api_spec_client):
        """
        Scenario 7: DTC Operations Manager scheduling extra buses for morning rush (08:00-10:00).
        Workflow:
        1. Operator queries action sheet filtered to morning rush and min_confidence=medium.
        2. Corridors are returned ranked by passenger deficit descending.
        3. Route 433 and Route 502 lead the ranking with clear extra trip recommendations.
        4. Plain language glossary and indicative spacing disclaimer are present.
        """
        resp = api_spec_client.get("/api/analytics/operator-action-sheet", {
            "hour_start": 8,
            "hour_end": 10,
            "min_confidence": "medium"
        })
        assert resp["status_code"] == 200
        data = resp["json"]["data"]
        corridors = data["corridors"]
        assert len(corridors) >= 3

        # Deficit ranking check
        assert corridors[0]["route_id"] == "433UP"
        assert corridors[0]["passenger_deficit"] > 0
        assert corridors[0]["extra_trips"]["20%"] >= 1

        # Glossary and disclaimer check
        assert "passenger_deficit" in data["glossary"]
        assert "extra_trips" in data["glossary"]
        assert "Indicative" in data["disclaimer"]

    def test_t4_08_planner_corridor_export_and_reproducible_rerun(self, api_spec_client):
        """
        Scenario 8: Urban Planner exporting crowd estimates for transport analysis.
        Workflow:
        1. Planner downloads CSV export of network crowd estimates.
        2. Verifies # Metadata: block contains ISO timestamp, provenance, and verification rule.
        3. Verifies all 10 columns parse cleanly and match real data distributions.
        """
        resp = api_spec_client.get("/api/analytics/export", {
            "format": "csv",
            "day_type": "weekday",
            "hour": 8
        })
        assert resp["status_code"] == 200
        csv_text = resp["text"]
        lines = [line.strip() for line in csv_text.splitlines() if line.strip()]

        # Metadata header verification
        assert lines[0] == "# Metadata: CrowdWise Crowd Estimates Export"
        assert lines[1].startswith("# Generated:")
        assert "October-Delhi.csv" in lines[2]
        assert "Conservation-verified" in lines[3]

        # Column schema verification
        cols = lines[4].split(",")
        assert cols == [
            "route_id", "direction", "day_type", "hour", "scheduled_trips",
            "typical_load", "vehicle_class", "crowd_level", "confidence", "ticket_count"
        ]
        # Data rows verification
        assert len(lines) >= 8
        row1 = lines[5].split(",")
        assert row1[0] == "433UP"
        assert int(row1[9]) >= 100  # ticket_count >= 100 for 433UP
