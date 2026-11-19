"""crowdwise/backend/app/services/assumptions_service.py
Authoritative Assumptions Registry Loader for CrowdWise (Brief R1, F1-F9).
Loads and caches `config/assumptions.yaml` with dual indexing by parameter_name and ID.
"""
import os
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import yaml

logger = logging.getLogger("crowdwise.assumptions_service")


def find_assumptions_path() -> Path:
    """Resolves path to config/assumptions.yaml across development, docker, and test runners."""
    env_path = os.getenv("ASSUMPTIONS_FILE")
    if env_path and Path(env_path).exists():
        return Path(env_path).resolve()

    # Search candidates relative to this file and current working directory
    base = Path(__file__).resolve()
    candidates = [
        base.parent.parent.parent.parent / "config" / "assumptions.yaml",  # from backend/app/services/
        base.parent.parent.parent / "config" / "assumptions.yaml",
        base.parent.parent / "config" / "assumptions.yaml",
        Path("config/assumptions.yaml"),
        Path("../config/assumptions.yaml"),
        Path("../../config/assumptions.yaml"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    return candidates[0]


class AssumptionsRegistry:
    """Thread-safe singleton registry caching config/assumptions.yaml."""
    _instance: Optional["AssumptionsRegistry"] = None

    def __init__(self, config_path: Optional[Union[str, Path]] = None):
        self.config_path = Path(config_path).resolve() if config_path else find_assumptions_path()
        self._raw_data: Dict[str, Any] = {}
        self._by_param: Dict[str, Dict[str, Any]] = {}
        self._by_id: Dict[str, Dict[str, Any]] = {}
        self._load()

    @classmethod
    def get_instance(cls, config_path: Optional[Union[str, Path]] = None) -> "AssumptionsRegistry":
        if cls._instance is None:
            cls._instance = cls(config_path)
        return cls._instance

    @classmethod
    def reset(cls) -> None:
        """Reset singleton (for testing)."""
        cls._instance = None

    def _load(self) -> None:
        """Loads assumptions from YAML with safe error fallback."""
        if not self.config_path.exists():
            logger.warning(f"AssumptionsRegistry: Config file not found at {self.config_path}. Using empty registry.")
            return

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                self._raw_data = yaml.safe_load(f) or {}

            assumptions_map = self._raw_data.get("assumptions", {})
            for param_key, record in assumptions_map.items():
                if not isinstance(record, dict):
                    continue
                param_name = record.get("parameter_name", param_key)
                record_id = record.get("id")

                self._by_param[param_name] = record
                if record_id:
                    self._by_id[record_id] = record

            logger.info(f"AssumptionsRegistry: Loaded {len(self._by_param)} assumptions from {self.config_path}")
        except Exception as e:
            logger.error(f"AssumptionsRegistry: Failed to load {self.config_path}: {e}", exc_info=True)

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieves raw parameter value by parameter_name or assumption ID (e.g. 'ASM-01')."""
        if key in self._by_param:
            return self._by_param[key].get("value", default)
        if key in self._by_id:
            return self._by_id[key].get("value", default)
        return default

    def get_record(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieves full assumption metadata record by parameter_name or ID."""
        return self._by_param.get(key) or self._by_id.get(key)

    def to_list(self) -> List[Dict[str, Any]]:
        """Returns all assumptions as a sorted list for JSON API endpoints."""
        records = list(self._by_param.values())
        return sorted(records, key=lambda r: str(r.get("id", "")))

    def to_dict(self) -> Dict[str, Any]:
        """Returns the full raw dictionary."""
        return self._raw_data


# Convenience functional accessors
def get_assumption(key: str, default: Any = None) -> Any:
    """Convenience getter for assumption value."""
    return AssumptionsRegistry.get_instance().get(key, default)


def get_assumption_record(key: str) -> Optional[Dict[str, Any]]:
    """Convenience getter for full assumption record."""
    return AssumptionsRegistry.get_instance().get_record(key)


def get_all_assumptions() -> List[Dict[str, Any]]:
    """Convenience getter for all assumption records."""
    return AssumptionsRegistry.get_instance().to_list()
