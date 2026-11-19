"""Crowd Prediction Service wrapping trained ML artifacts and RCI mapping."""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np
import pandas as pd

from app.ml.features import FeaturePipeline
from app.ml.evaluate import RCICalibrator

logger = logging.getLogger(__name__)

# Search paths for ML artifacts
_CANDIDATE_PATHS = [
    Path(__file__).resolve().parent.parent.parent.parent / "models",
    Path(__file__).resolve().parent.parent.parent / "models",
    Path("models"),
    Path("../models"),
]
MODELS_DIR = next((p for p in _CANDIDATE_PATHS if (p / "random_forest_regressor.pkl").exists()), _CANDIDATE_PATHS[0])


class MLService:
    """Singleton service for loading models and executing fast predictions."""

    _instance = None

    def __init__(self, models_dir: Path = MODELS_DIR):
        self.models_dir = Path(models_dir)
        self.rf_model = None
        self.baseline_model = None
        self.feature_pipeline: Optional[FeaturePipeline] = None
        self.calibrator: Optional[RCICalibrator] = None
        self.metadata: Dict[str, Any] = {}
        self.is_loaded = False
        self._load_artifacts()

    @classmethod
    def get_instance(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_artifacts(self):
        """Loads trained model artifacts if present on disk."""
        rf_path = self.models_dir / "random_forest_regressor.pkl"
        base_path = self.models_dir / "baseline_regressor.pkl"
        pipe_path = self.models_dir / "feature_pipeline.pkl"
        calib_path = self.models_dir / "rci_calibrator.json"
        meta_path = self.models_dir / "metadata.json"
        
        try:
            if base_path.exists():
                self.baseline_model = joblib.load(base_path)
                
            if rf_path.exists() and pipe_path.exists():
                self.rf_model = joblib.load(rf_path)
                self.feature_pipeline = joblib.load(pipe_path)
                
            if calib_path.exists():
                with open(calib_path, "r", encoding="utf-8") as f:
                    self.calibrator = RCICalibrator.from_dict(json.load(f))
            else:
                self.calibrator = RCICalibrator(rated_capacity=60.0, mode="capacity")
                
            if meta_path.exists():
                with open(meta_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                    
            if self.rf_model is not None or self.baseline_model is not None:
                self.is_loaded = True
                logger.info(f"MLService: Successfully loaded models from {self.models_dir}")
            else:
                self.is_loaded = False
                logger.info("MLService: No pre-trained artifacts found. Will use heuristic fallback.")
        except Exception as e:
            logger.warning(f"MLService: Error loading ML artifacts: {e}")
            self.is_loaded = False

    def _enrich_prediction(
        self,
        pred_dict: Dict[str, Any],
        route_id: str,
        direction_id: int,
        zone_id: int,
        day_type: str,
        hour: int,
    ) -> Dict[str, Any]:
        """Enriches prediction dictionary with sample_ticket_count and verbal confidence_text (Brief R2 F1)."""
        try:
            from app.services.crowd_service import CrowdService
            ticket_count = CrowdService.query_cell_ticket_count(
                route_id=str(route_id),
                direction_id=int(direction_id),
                day_type=str(day_type),
                hour=int(hour),
                zone_id=int(zone_id),
            )
            pred_dict["sample_ticket_count"] = int(ticket_count or 0)
            if ticket_count > 0:
                _, conf_text = CrowdService.get_confidence(ticket_count)
                pred_dict["confidence_text"] = conf_text
            else:
                conf = pred_dict.get("confidence", "low")
                pred_dict["confidence_text"] = CrowdService.CONFIDENCE_TEXTS.get(
                    conf, "Based on little data"
                )
        except Exception as e:
            logger.debug(f"MLService: Error enriching prediction: {e}")
            pred_dict.setdefault("sample_ticket_count", 0)
            pred_dict.setdefault("confidence_text", "Based on little data")

        return pred_dict

    def predict_crowd(
        self,
        route_id: str,
        direction_id: int,
        zone_id: int,
        day_type: str = "WEEKDAY",
        hour: int = 18,
        enrich: bool = True,
    ) -> Dict[str, Any]:
        """Returns estimated crowdedness, RCI, category, label, and confidence for a route cell.
        Executes a 3-tier fallback: Random Forest -> Stratified Baseline Regressor -> Diurnal Heuristic.
        """
        # Tier 1: Production Random Forest Regressor
        if self.is_loaded and self.rf_model is not None and self.feature_pipeline is not None:
            try:
                X = self.feature_pipeline.transform_single(
                    route_id=str(route_id),
                    direction_id=int(direction_id),
                    zone_id=int(zone_id),
                    day_type=str(day_type),
                    hour=int(hour),
                )
                has_hist = np.array([int(X[0, -1])])
                mean_preds, p10, p90, confidences = self.rf_model.predict_with_confidence(X, has_history=has_hist)

                pred_load = float(mean_preds[0])
                p10_val = float(p10[0])
                p90_val = float(p90[0])
                confidence = confidences[0]

                if self.calibrator is not None:
                    rci_val = float(self.calibrator.compute_rci(np.array([pred_load]))[0])
                    category = self.calibrator.to_category(np.array([rci_val]))[0]
                    label = self.calibrator.to_label(np.array([rci_val]))[0]
                else:
                    rci_val = min(100.0, max(0.0, (pred_load / 60.0) * 100.0))
                    category = "High" if rci_val >= 75.0 else ("Moderate" if rci_val >= 40.0 else "Low")
                    label = "Crowded" if rci_val >= 75.0 else ("Standing Room" if rci_val >= 40.0 else "Seats Available")

                res = {
                    "route_id": str(route_id),
                    "direction_id": int(direction_id),
                    "zone_id": int(zone_id),
                    "day_type": str(day_type),
                    "hour": int(hour),
                    "load": round(pred_load, 1),
                    "rci": round(rci_val, 1),
                    "category": category,
                    "crowding_category": category,
                    "label": label,
                    "crowding_label": label,
                    "confidence": confidence,
                    "tier": "estimated",
                    "interval": {
                        "p10": round(p10_val, 1),
                        "p90": round(p90_val, 1),
                    },
                    "model_version": self.metadata.get("version", "1.0.0"),
                }
                return self._enrich_prediction(res, route_id, direction_id, zone_id, day_type, hour) if enrich else res
            except Exception as e:
                logger.warning(f"MLService: Random Forest inference failed ({e}), attempting baseline fallback.")

        # Tier 2: Stratified Historical Baseline Regressor
        if self.baseline_model is not None:
            try:
                pred_load = float(self.baseline_model.predict_single(
                    route_id=str(route_id),
                    direction_id=int(direction_id),
                    zone_id=int(zone_id),
                    day_type=str(day_type),
                    hour=int(hour),
                ))
                p10_val = max(0.0, pred_load * 0.8)
                p90_val = pred_load * 1.2
                confidence = "medium"

                if self.calibrator is not None:
                    rci_val = float(self.calibrator.compute_rci(np.array([pred_load]))[0])
                    category = self.calibrator.to_category(np.array([rci_val]))[0]
                    label = self.calibrator.to_label(np.array([rci_val]))[0]
                else:
                    rci_val = min(100.0, max(0.0, (pred_load / 60.0) * 100.0))
                    category = "High" if rci_val >= 75.0 else ("Moderate" if rci_val >= 40.0 else "Low")
                    label = "Crowded" if rci_val >= 75.0 else ("Standing Room" if rci_val >= 40.0 else "Seats Available")

                res = {
                    "route_id": str(route_id),
                    "direction_id": int(direction_id),
                    "zone_id": int(zone_id),
                    "day_type": str(day_type),
                    "hour": int(hour),
                    "load": round(pred_load, 1),
                    "rci": round(rci_val, 1),
                    "category": category,
                    "crowding_category": category,
                    "label": label,
                    "crowding_label": label,
                    "confidence": confidence,
                    "tier": "estimated",
                    "interval": {
                        "p10": round(p10_val, 1),
                        "p90": round(p90_val, 1),
                    },
                    "model_version": "baseline_regressor",
                }
                return self._enrich_prediction(res, route_id, direction_id, zone_id, day_type, hour) if enrich else res
            except Exception as e:
                logger.warning(f"MLService: Baseline inference failed ({e}), attempting heuristic fallback.")

        # Tier 3: Domain-Informed Diurnal Fallback Heuristic
        is_peak = hour in [8, 9, 10, 17, 18, 19, 20]
        is_night = hour >= 22 or hour <= 5
        base_load = 38.0 if is_peak else (8.0 if is_night else 22.0)
        if day_type in ["SUNDAY", "HOLIDAY"]:
            base_load *= 0.75

        rci = min(100.0, max(0.0, (base_load / 60.0) * 100.0))
        category = "High" if rci >= 75.0 else ("Moderate" if rci >= 40.0 else "Low")
        label = "Crowded" if rci >= 75.0 else ("Standing Room" if rci >= 40.0 else "Seats Available")

        res = {
            "route_id": str(route_id),
            "direction_id": int(direction_id),
            "zone_id": int(zone_id),
            "day_type": str(day_type),
            "hour": int(hour),
            "load": round(base_load, 1),
            "rci": round(rci, 1),
            "category": category,
            "crowding_category": category,
            "label": label,
            "crowding_label": label,
            "confidence": "low",
            "tier": "estimated",
            "interval": {
                "p10": round(max(0.0, base_load * 0.7), 1),
                "p90": round(base_load * 1.3, 1),
            },
            "model_version": "fallback_heuristic",
        }
        return self._enrich_prediction(res, route_id, direction_id, zone_id, day_type, hour) if enrich else res

    def predict_journey_zones(
        self,
        route_id: str,
        direction_id: int,
        zone_ids: List[int],
        day_type: str,
        hour: int,
    ) -> List[Dict[str, Any]]:
        """Predicts crowding across multiple contiguous zones on a journey leg."""
        return [
            self.predict_crowd(route_id, direction_id, z, day_type, hour)
            for z in zone_ids
        ]

    def predict_route_matrix(
        self,
        route_id: str,
        direction_id: int = 0,
        day_type: str = "WEEKDAY",
    ) -> List[Dict[str, Any]]:
        """Vectorized 8-zone x 24-hour crowdedness matrix generation for low-latency queries."""
        matrix = []
        if self.is_loaded and self.rf_model is not None and self.feature_pipeline is not None:
            try:
                rows = [
                    {"route_id": str(route_id), "direction_id": direction_id, "zone_id": z, "day_type": day_type, "hour": h}
                    for z in range(8) for h in range(24)
                ]
                df_grid = pd.DataFrame(rows)
                X = self.feature_pipeline.transform(df_grid).values
                has_hist = X[:, -1].astype(int)
                preds, p10, p90, confs = self.rf_model.predict_with_confidence(X, has_history=has_hist)
                rcis = self.calibrator.compute_rci(preds) if self.calibrator else np.clip(preds / 60.0 * 100.0, 0.0, 100.0)
                cats = self.calibrator.to_category(rcis) if self.calibrator else ["Low"] * len(rcis)

                idx = 0
                for z in range(8):
                    zone_row = {"zone_id": z, "hours": []}
                    for h in range(24):
                        zone_row["hours"].append({
                            "hour": h,
                            "load": round(float(preds[idx]), 1),
                            "rci": round(float(rcis[idx]), 1),
                            "category": cats[idx],
                        })
                        idx += 1
                    matrix.append(zone_row)
                return matrix
            except Exception as e:
                logger.warning(f"MLService: Vectorized route matrix failed ({e}), falling back to point-wise loop.")

        # Fallback loop
        for z in range(8):
            zone_row = {"zone_id": z, "hours": []}
            for h in range(24):
                pred = self.predict_crowd(route_id, direction_id, z, day_type, h, enrich=False)
                zone_row["hours"].append({
                    "hour": h,
                    "load": pred["load"],
                    "rci": pred["rci"],
                    "category": pred["category"],
                })
            matrix.append(zone_row)
        return matrix

