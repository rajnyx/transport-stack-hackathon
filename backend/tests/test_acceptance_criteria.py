"""
Unit and contract tests strictly verifying the 6 CrowdWise Acceptance Criteria.

Mandated by ORIGINAL_REQUEST.md & PROJECT.md:
1. Confidence thresholds and thin-cell fallback (F1)
2. Capacity normalisation & vehicle class index (is_ac), capacity_verified: false, no unverified occupancy % (F2)
3. Scenario-based extra-trip calculation (0%, 10%, 20%, 30%) (F3, F4)
4. Scrubber offsets (0, 15, 30, 45, 60 min) (F5)
5. Flow reconciliation (boardings - alightings = running total) (F6)
6. Export column integrity & # Metadata: header block (F7)
"""

import math
import pytest
from tests.e2e.conftest import SpecReferenceOracle, SpecContractTestClient


@pytest.fixture
def api_spec_client():
    """Provides isolated SpecContractTestClient for acceptance criteria tests."""
    return SpecContractTestClient(data_mode="demo")


# ===========================================================================
# AC 1: Confidence Thresholds & Thin-Cell Fallback
# ===========================================================================

class TestAcceptanceConfidenceThresholds:
    """Acceptance tests verifying F1 confidence thresholds and thin-cell fallback."""

    def test_ac_confidence_threshold_high_at_100_and_above(self):
        """1. Asserts ticket count >= 100 maps to high confidence and verbal description."""
        for count in [100, 101, 250, 1000]:
            level, text = SpecReferenceOracle.confidence_rating(count)
            assert level == "high", f"Count {count} should map to high confidence"
            assert text == "Based on a lot of data"

    def test_ac_confidence_threshold_medium_between_30_and_99(self):
        """2. Asserts ticket count 30-99 maps to medium confidence and verbal description."""
        for count in [30, 31, 65, 99]:
            level, text = SpecReferenceOracle.confidence_rating(count)
            assert level == "medium", f"Count {count} should map to medium confidence"
            assert text == "Based on some data"

    def test_ac_confidence_threshold_low_between_10_and_29(self):
        """3. Asserts ticket count 10-29 maps to low confidence and verbal description."""
        for count in [10, 11, 20, 29]:
            level, text = SpecReferenceOracle.confidence_rating(count)
            assert level == "low", f"Count {count} should map to low confidence"
            assert text == "Based on little data"

    def test_ac_confidence_threshold_thin_below_10(self):
        """4. Asserts ticket count < 10 maps to thin confidence and Not enough data fallback."""
        for count in [0, 1, 5, 9]:
            level, text = SpecReferenceOracle.confidence_rating(count)
            assert level == "thin", f"Count {count} should map to thin confidence"
            assert text == "Not enough data"

    def test_ac_thin_cell_fallback_displays_not_enough_data(self, api_spec_client):
        """5. Confirms thin cells do not claim confident crowd estimates without fallback."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        corridors = resp["json"]["data"]["corridors"]
        thin_corridors = [c for c in corridors if c["confidence"] == "thin"]
        for tc in thin_corridors:
            assert tc["sample_ticket_count"] < 10
            assert tc["confidence_text"] == "Not enough data"
            assert tc["crowd_level"] == "Not enough data"

    def test_ac_thin_cell_never_claims_high_confidence(self):
        """6. Invariant: counts below 10 must NEVER produce high or medium confidence."""
        for count in range(10):
            level, _ = SpecReferenceOracle.confidence_rating(count)
            assert level not in ("high", "medium"), f"Count {count} illegally produced {level}"


# ===========================================================================
# AC 2: Capacity Normalisation & Vehicle Class
# ===========================================================================

class TestAcceptanceCapacityNormalization:
    """Acceptance tests verifying F2 vehicle class capacity index and unverified flag."""

    def test_ac_capacity_evaluated_within_vehicle_class_is_ac(self):
        """7. Tests AC (55 capacity) vs Non-AC (60 capacity) relative crowding index calculation."""
        load = 45.0
        rci_non_ac = SpecReferenceOracle.relative_crowding_index(load, rated_capacity=60.0)
        rci_ac = SpecReferenceOracle.relative_crowding_index(load, rated_capacity=55.0)
        assert rci_non_ac == pytest.approx(75.0, abs=0.1)
        assert rci_ac == pytest.approx(81.82, abs=0.1)
        assert rci_ac > rci_non_ac, "AC route with same load must have higher RCI due to smaller capacity"

    def test_ac_nominal_capacity_assumption_recorded_as_unverified(self, api_spec_client):
        """8. Verifies capacity_verified is strictly False across routes and action sheet."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        for corr in resp["json"]["data"]["corridors"]:
            assert corr["capacity_verified"] is False, "capacity_verified must be strictly False"

    def test_ac_unverified_occupancy_percentage_is_hidden(self, api_spec_client):
        """9. Asserts no raw unverified occupancy percentage is displayed in journey options."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_003"
        })
        assert resp["status_code"] == 200
        options = resp["json"]["data"]["options"]
        for opt in options:
            assert opt.get("occupancy_percent") is None, "Occupancy percentage must be None/hidden"
            assert opt["capacity_verified"] is False

    def test_ac_crowd_index_normalization_without_invented_capacities(self):
        """10. Crowd index bounds RCI to [0, 100] without inventing variable bus configurations."""
        assert SpecReferenceOracle.relative_crowding_index(0.0, 60.0) == 0.0
        assert SpecReferenceOracle.relative_crowding_index(120.0, 60.0) == 100.0
        assert SpecReferenceOracle.relative_crowding_index(30.0, 60.0) == 50.0


# ===========================================================================
# AC 3: Scenario-Based Extra-Trip Calculation
# ===========================================================================

class TestAcceptanceScenarioExtraTrips:
    """Acceptance tests verifying F3 unrecorded ridership and F4 extra trip calculations."""

    def test_ac_four_scenarios_strictly_0_10_20_30_percent(self, api_spec_client):
        """11. Asserts sensitivity analysis scenarios are exactly 0.0, 0.10, 0.20, 0.30."""
        resp = api_spec_client.get("/api/analytics/sensitivity")
        assert resp["status_code"] == 200
        scenarios = resp["json"]["data"]["scenarios"]
        assert scenarios == [0.0, 0.10, 0.20, 0.30]

    def test_ac_extra_trip_calculation_formula_accuracy(self):
        """12. Mathematical verification: Extra Trips = ceil((Deficit * Scheduled Trips) / Capacity)."""
        extra_0 = SpecReferenceOracle.extra_trips_needed(4, 68.2, 60.0, 0.0)
        assert extra_0 == 1
        extra_30 = SpecReferenceOracle.extra_trips_needed(4, 68.2, 60.0, 0.30)
        assert extra_30 == 2

    def test_ac_extra_trips_zero_when_demand_below_capacity(self):
        """13. Extra trips must be strictly 0 when load is at or below rated capacity."""
        extra = SpecReferenceOracle.extra_trips_needed(5, 45.0, 60.0, 0.0)
        assert extra == 0
        extra_with_10 = SpecReferenceOracle.extra_trips_needed(5, 45.0, 60.0, 0.10)
        assert extra_with_10 == 0

    def test_ac_extra_trips_monotonically_non_decreasing_with_scenarios(self, api_spec_client):
        """14. Invariant: Extra trips across scenarios must be monotonically non-decreasing."""
        resp = api_spec_client.get("/api/analytics/operator-action-sheet")
        assert resp["status_code"] == 200
        corridors = resp["json"]["data"]["corridors"]
        for c in corridors:
            et = c["extra_trips"]
            assert et["0%"] <= et["10%"] <= et["20%"] <= et["30%"], (
                f"Extra trips for {c['route_id']} not monotonic: {et}"
            )


# ===========================================================================
# AC 4: Departure Time Scrubber Offsets
# ===========================================================================

class TestAcceptanceScrubberOffsets:
    """Acceptance tests verifying F5 departure scrubber offsets and comparison tips."""

    def test_ac_scrubber_offsets_0_15_30_45_60_minutes_valid(self, api_spec_client):
        """15. Validates all 5 required scrubber offset values (0, 15, 30, 45, 60 min)."""
        for offset in [0, 15, 30, 45, 60]:
            resp = api_spec_client.get("/api/plan", {
                "origin_id": "DEL_001",
                "destination_id": "DEL_002",
                "departure_time": "08:30:00",
                "offset_minutes": offset
            })
            assert resp["status_code"] == 200
            assert resp["json"]["ok"] is True
            assert resp["json"]["data"]["offset_minutes"] == offset

    def test_ac_scrubber_prediction_matches_shifted_time(self, api_spec_client):
        """16. Scheduled departures shift forward in time by the exact offset."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 30
        })
        assert resp["status_code"] == 200
        opts = resp["json"]["data"]["options"]
        assert len(opts) >= 1
        assert opts[0]["scheduled_departure"] == "09:00:00"

    def test_ac_departure_tips_format_and_relevance(self, api_spec_client):
        """17. Verifies departure tips provide plain language advice when later departure is better."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "departure_time": "08:30:00",
            "offset_minutes": 0
        })
        assert resp["status_code"] == 200
        tips = resp["json"]["data"]["departure_tips"]
        assert isinstance(tips, list)
        if tips:
            assert any("later offers" in tip or "avoids" in tip for tip in tips)

    def test_ac_scrubber_offset_preserved_in_response_meta(self, api_spec_client):
        """18. The offset parameter is preserved and echoed in response metadata."""
        resp = api_spec_client.get("/api/plan", {
            "origin_id": "DEL_001",
            "destination_id": "DEL_002",
            "offset_minutes": 45
        })
        assert resp["status_code"] == 200
        assert resp["json"]["meta"]["offset_minutes"] == 45


# ===========================================================================
# AC 5: Flow Conservation & Reconciliation
# ===========================================================================

class TestAcceptanceFlowReconciliation:
    """Acceptance tests verifying F6 stop-level passenger flow conservation."""

    def test_ac_flow_conservation_running_total_formula(self, api_spec_client):
        """19. Running passenger load satisfies Load_s = max(0, Load_{s-1} + B_s - A_s)."""
        resp = api_spec_client.get("/api/routes/433UP/flow", {
            "direction": "UP",
            "hour": 8,
            "day_type": "weekday"
        })
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        assert len(stops) >= 3
        assert SpecReferenceOracle.flow_conservation(stops) is True

    def test_ac_flow_non_negative_occupancy_invariant(self, api_spec_client):
        """20. Running passenger load is non-negative at every stop along the corridor."""
        resp = api_spec_client.get("/api/routes/433UP/flow")
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        for stop in stops:
            assert stop["running_load"] >= 0.0, f"Negative load at stop {stop['stop_id']}"

    def test_ac_flow_terminal_stop_conservation_and_clearance(self, api_spec_client):
        """21. Origin alightings must be zero and terminal clearance clears passenger load."""
        resp = api_spec_client.get("/api/routes/433UP/flow")
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        assert stops[0]["alightings"] == 0.0
        assert stops[0]["running_load"] == pytest.approx(stops[0]["boardings"], abs=0.1)
        assert stops[-1]["boardings"] == 0.0
        assert stops[-1]["running_load"] == 0.0

    def test_ac_flow_sample_records_attribution_mode_a_b(self, api_spec_client):
        """22. Every stop flow record reports ticket sample count and attribution mode (Mode A/B)."""
        resp = api_spec_client.get("/api/routes/433UP/flow")
        assert resp["status_code"] == 200
        stops = resp["json"]["data"]["stops"]
        for stop in stops:
            assert stop["sample_ticket_count"] > 0
            assert stop["attribution_mode"] in ("Mode A (Observed O-D)", "Mode B (Inferred Alightings)")


# ===========================================================================
# AC 6: Export Column Integrity & Metadata Header
# ===========================================================================

class TestAcceptanceExportColumnIntegrity:
    """Acceptance tests verifying F7 CSV/JSON export structure and header block."""

    def test_ac_export_csv_metadata_header_block_structure(self, api_spec_client):
        """23. Export CSV starts with 4-line # Metadata: block detailing provenance and timestamp."""
        resp = api_spec_client.get("/api/analytics/export", {
            "format": "csv",
            "day_type": "weekday",
            "hour": 8
        })
        assert resp["status_code"] == 200
        csv_text = resp["text"]
        lines = [line.strip() for line in csv_text.splitlines() if line.strip()]
        assert len(lines) >= 5
        assert lines[0].startswith("# Metadata:")
        assert lines[1].startswith("# Generated:")
        assert lines[2].startswith("# Provenance:")
        assert lines[3].startswith("# Verification:")

    def test_ac_export_csv_mandatory_columns_exact_order(self, api_spec_client):
        """24. Line 5 of export CSV contains the exact 10 mandatory columns in specified order."""
        resp = api_spec_client.get("/api/analytics/export", {"format": "csv"})
        assert resp["status_code"] == 200
        csv_text = resp["text"]
        lines = [line.strip() for line in csv_text.splitlines() if line.strip()]
        header_row = lines[4]
        expected_columns = [
            "route_id", "direction", "day_type", "hour", "scheduled_trips",
            "typical_load", "vehicle_class", "crowd_level", "confidence", "ticket_count"
        ]
        assert header_row == ",".join(expected_columns)
