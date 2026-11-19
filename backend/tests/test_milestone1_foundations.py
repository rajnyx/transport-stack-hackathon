"""crowdwise/backend/tests/test_milestone1_foundations.py
Comprehensive Foundation Verification Suite for Milestone 1:
- Canonical Assumptions Registry (ASM-01 to ASM-23, bus_capacity_verified: false)
- F1 Confidence & Data Sparsity Thresholds (Verbal confidence text & ticket counts)
- F2 Capacity Normalization & Vehicle Class Calibration (55 AC vs 60 Non-AC, occupancy suppression)
- F3 Sensitivity Analysis Endpoint (/api/analytics/sensitivity)
- MLService prediction enrichment
"""
import pytest
from app import create_app, db
from app.services.assumptions_service import (
    AssumptionsRegistry,
    get_assumption,
    get_assumption_record,
    get_all_assumptions,
)
from app.services.crowd_service import CrowdService, CONFIDENCE_TEXTS
from app.services.ml_service import MLService


@pytest.fixture(scope="module")
def test_app():
    """Provides a Flask application instance configured for testing."""
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture(scope="module")
def client(test_app):
    """Provides a test client for API requests."""
    return test_app.test_client()


# ===========================================================================
# 1. ASSUMPTIONS REGISTRY (ASM-01 to ASM-23)
# ===========================================================================

class TestAssumptionsRegistry:
    """Verifies complete, authoritative registration of all 23 hackathon assumptions."""

    def test_all_23_assumptions_exist(self):
        """Verifies exactly 23 assumptions are loaded and indexed."""
        all_assumptions = get_all_assumptions()
        assert len(all_assumptions) == 23, f"Expected 23 assumptions, found {len(all_assumptions)}"

        # Verify all IDs from ASM-01 to ASM-23 exist
        expected_ids = {f"ASM-{i:02d}" for i in range(1, 24)}
        actual_ids = {a.get("id") for a in all_assumptions}
        assert expected_ids == actual_ids, f"Missing IDs: {expected_ids - actual_ids}"

    def test_bus_capacity_verified_is_strictly_boolean_false(self):
        """Verifies ASM-04 bus_capacity_verified is strictly boolean False (not string)."""
        val_by_param = get_assumption("bus_capacity_verified")
        val_by_id = get_assumption("ASM-04")
        assert val_by_param is False
        assert val_by_id is False
        assert isinstance(val_by_param, bool)

    def test_unrecorded_rider_scenarios_from_brief(self):
        """Verifies ASM-05 unrecorded rider scenarios list matches [0.0, 0.1, 0.2, 0.3]."""
        scenarios = get_assumption("unrecorded_rider_scenarios")
        assert scenarios == [0.00, 0.10, 0.20, 0.30]

    def test_dual_indexing_by_param_name_and_id(self):
        """Verifies every assumption is accessible both by parameter_name and ASM ID."""
        test_pairs = [
            ("bus_capacity_standard", "ASM-01", 60),
            ("bus_capacity_ac", "ASM-02", 55),
            ("bus_capacity_midi", "ASM-03", 35),
            ("pink_pass_expansion_factor", "ASM-07", 1.30),
            ("confidence_high_min_tickets", "ASM-08", 100),
            ("confidence_medium_min_tickets", "ASM-09", 30),
            ("confidence_low_min_tickets", "ASM-10", 10),
            ("walking_speed_kph", "ASM-15", 4.5),
            ("walking_detour_factor", "ASM-16", 1.30),
            ("f9_earlier_stop_max_walk_m", "ASM-19", 400),
            ("holiday_calendar_override", "ASM-23", "2026-10-02"),
        ]
        for param, asm_id, expected_val in test_pairs:
            assert get_assumption(param) == expected_val, f"Mismatch for {param}"
            assert get_assumption(asm_id) == expected_val, f"Mismatch for {asm_id}"

    def test_record_metadata_schema_completeness(self):
        """Verifies each assumption record has required metadata fields."""
        required_keys = {"id", "parameter_name", "value", "unit", "source", "status", "role", "category"}
        for record in get_all_assumptions():
            for key in required_keys:
                assert key in record, f"Missing key '{key}' in record {record.get('id')}"
            assert record["status"] in ["our assumption", "from data", "from brief"]


# ===========================================================================
# 2. F1 CONFIDENCE & DATA SPARSITY THRESHOLDS
# ===========================================================================

class TestF1ConfidenceMapping:
    """Verifies F1 verbal confidence rating and data sparsity thin cell handling."""

    @pytest.mark.parametrize("ticket_count,expected_tier,expected_text", [
        (250, "high", "Based on a lot of data"),
        (100, "high", "Based on a lot of data"),
        (99, "medium", "Based on some data"),
        (45, "medium", "Based on some data"),
        (30, "medium", "Based on some data"),
        (29, "low", "Based on little data"),
        (15, "low", "Based on little data"),
        (10, "low", "Based on little data"),
        (9, "thin", "Not enough data"),
        (3, "thin", "Not enough data"),
        (0, "thin", "Not enough data"),
    ])
    def test_f1_verbal_confidence_intervals(self, ticket_count, expected_tier, expected_text):
        """Verifies exact verbal confidence mapping across all threshold intervals."""
        tier, text_desc = CrowdService.get_confidence(ticket_count)
        assert tier == expected_tier
        assert text_desc == expected_text

    def test_rci_to_crowd_label_sparsity_handling(self):
        """Verifies that thin cells emit 'Not enough data' and 'Unknown' category."""
        # Thin data cell
        label, cat = CrowdService.rci_to_crowd_label(85.0, confidence="thin")
        assert label == "Not enough data"
        assert cat == "Unknown"

        # Confident cells
        label_low, cat_low = CrowdService.rci_to_crowd_label(25.0, confidence="high")
        assert label_low == "Seats Available" and cat_low == "Low"

        label_mod, cat_mod = CrowdService.rci_to_crowd_label(55.0, confidence="high")
        assert label_mod == "Standing Room" and cat_mod == "Moderate"

        label_high, cat_high = CrowdService.rci_to_crowd_label(85.0, confidence="high")
        assert label_high == "Crowded" and cat_high == "High"

    def test_ml_service_prediction_enrichment(self):
        """Verifies predict_crowd includes sample_ticket_count and confidence_text."""
        ml_service = MLService.get_instance()
        pred = ml_service.predict_crowd(
            route_id="8UP",
            direction_id=0,
            zone_id=0,
            day_type="WEEKDAY",
            hour=8,
        )
        assert "sample_ticket_count" in pred
        assert isinstance(pred["sample_ticket_count"], int)
        assert pred["sample_ticket_count"] > 0
        assert "confidence" in pred
        assert pred["confidence"] in ["high", "medium", "low"]
        assert "confidence_text" in pred
        assert isinstance(pred["confidence_text"], str)


# ===========================================================================
# 3. F2 CAPACITY NORMALIZATION & OCCUPANCY SUPPRESSION
# ===========================================================================

class TestF2CapacityNormalization:
    """Verifies vehicle class RCI calibration and hiding unverified occupancy percentages."""

    def test_vehicle_class_rci_strictly_calibrated(self):
        """Verifies 45 passengers yields 81.8% on AC (C=55) vs 75.0% on Non-AC (C=60)."""
        rci_ac = CrowdService.compute_vehicle_class_rci(45.0, is_ac=True)
        rci_non_ac = CrowdService.compute_vehicle_class_rci(45.0, is_ac=False)
        assert rci_ac == 81.8
        assert rci_non_ac == 75.0

    def test_vehicle_class_rci_boundary_clamping(self):
        """Verifies RCI clamping between 0.0 and 100.0."""
        assert CrowdService.compute_vehicle_class_rci(-5.0, is_ac=True) == 0.0
        assert CrowdService.compute_vehicle_class_rci(120.0, is_ac=True) == 100.0

    def test_occupancy_percentage_is_hidden_in_routes_api(self, client):
        """Verifies st['occupancyToNextStop'] is None when bus_capacity_verified is false."""
        res = client.get("/api/routes/8UP")
        assert res.status_code == 200
        body = res.get_json()
        assert body["ok"] is True
        stops = body["data"]["stops"]
        assert len(stops) > 0
        for st in stops:
            assert st.get("occupancyToNextStop") is None, (
                f"Occupancy percentage must be None when unverified, got {st.get('occupancyToNextStop')}"
            )
            assert st.get("occupancy_to_next_stop") is None
            assert st.get("occupancy_available") is False


# ===========================================================================
# 4. F3 SENSITIVITY ANALYSIS ENDPOINT (/api/analytics/sensitivity)
# ===========================================================================

class TestF3SensitivityEndpoint:
    """Verifies the F3 sensitivity endpoint returns top-overloaded routes under 4 scenarios."""

    def test_sensitivity_endpoint_envelope_and_scenarios(self, client):
        """Verifies HTTP 200, envelope structure, and 4 scenarios [0%, 10%, 20%, 30%]."""
        res = client.get("/api/analytics/sensitivity?day_type=weekday&hour=9")
        assert res.status_code == 200
        body = res.get_json()
        assert body["ok"] is True
        assert body["meta"]["data_tier"] == "organizer"

        data = body["data"]
        assert data["scenarios"] == [0.0, 0.10, 0.20, 0.30]
        assert data["day_type"] == "WEEKDAY"
        assert data["hour"] == 9
        assert isinstance(data["top_routes"], list)
        assert len(data["top_routes"]) > 0

    def test_sensitivity_route_payload_invariants(self, client):
        """Verifies top-overloaded route payload invariants."""
        res = client.get("/api/analytics/sensitivity?day_type=weekday&limit=5")
        assert res.status_code == 200
        routes = res.get_json()["data"]["top_routes"]
        assert len(routes) <= 5

        for r in routes:
            assert "route_id" in r
            assert "route_name" in r
            assert "baseline_load" in r
            assert "scenario_loads" in r
            s_loads = r["scenario_loads"]
            assert "0%" in s_loads and "10%" in s_loads and "20%" in s_loads and "30%" in s_loads

            # Monotonic load increase across scenarios
            assert s_loads["0%"] <= s_loads["10%"] <= s_loads["20%"] <= s_loads["30%"]
            assert "baseline_crowd" in r
            assert "scenario_30_crowd" in r
            assert r["vehicle_class"] in ["AC", "Non-AC"]
            assert r["nominal_capacity"] in [55, 60]
            assert r["sample_ticket_count"] >= 10
            assert r["confidence"] in ["high", "medium", "low", "thin"]
            assert r["confidence_text"] in CONFIDENCE_TEXTS.values()

    def test_analytics_assumptions_endpoint(self, client):
        """Verifies GET /api/analytics/assumptions returns all 23 assumptions."""
        res = client.get("/api/analytics/assumptions")
        assert res.status_code == 200
        body = res.get_json()
        assert body["ok"] is True
        assumptions = body["data"]["assumptions"]
        assert len(assumptions) == 23
        assert any(a["id"] == "ASM-04" and a["value"] is False for a in assumptions)
