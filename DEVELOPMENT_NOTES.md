# DEVELOPMENT_NOTES.md — Decisions, Assumptions & Conflict Log

## 1. Project Initialization & Architecture
- **Repository Location:** `transport-stack-hackathon/` connected to `https://github.com/rajnyx/transport-stack-hackathon.git`.
- **Autonomy Mode:** Fully autonomous full-stack development, ML modeling, data pipeline construction, testing, and submission packaging.

## 2. Real Datasets Ingestion & Profiling (2026-11-14)
- **Organizer ETM Dataset:** `October-Delhi.csv` containing 2,559,899 records from Oct 01, 2026 to Oct 31, 2026 (~290 MB).
- **Delhi Static GTFS Schedule:** 6,862 bus stops, 2,574 routes, 3,498 route patterns, and 109,660 pattern stops.
- **Cleaning & Ingestion Funnel:**
  - Zero dropped rows on mandatory fields (0 nulls in route, start_stop_name, end_stop_name, created_at, passenger_count, amount, is_ac).
  - Mode A (Exact O-D): 1,979,418 records (77.32% exact O-D match rate).
  - Mode B (Inferred Alightings): 283,240 records (11.06%).
  - Total Staged Demand Facts: 3,322,312 8-zone corridor facts loaded into `fact_zone_demand` and `data/staging/staging_zone_loads.parquet`.
  - Materialized fast analytics tables: `fact_daily_summary` (31 rows) and `fact_hourly_summary` (72 rows) for < 5ms API queries.

## 3. Assumptions & Calibrations
- **Bus Capacity:** Assumed standard DTC low-floor capacity of 60 passengers (40 seated + 20 standing). Flagged in metadata.
- **Expansion Factor ($\gamma_r$):** Calibrated to $\gamma_r = 1.30$ to account for Delhi's *Mukhyamantri Mahila Yatra Yojana* (Pink Pass Scheme for women), representing ~30% of actual non-ticketed passenger load.
- **Walking Speed:** Haversine distance multiplied by 1.3 road detour factor divided by 4.5 km/h walking speed.
- **Zone Partitioning:** Closed-form formula $\text{zone\_id} = \min(7, \lfloor 8s / N \rfloor)$.
- **Relative Crowding Index (RCI 0–100):**
  - Low (<40): **"Seats Available"** ($\le 24$ passengers)
  - Moderate (40–70): **"Standing Room"** ($24$–$42$ passengers)
  - High ($\ge 70$): **"Crowded"** ($> 42$ passengers)

## 4. Machine Learning & Retraining
- **Chronological Split Invariant:** $\max(D_{\text{train}}) < \min(D_{\text{val}}) < \min(D_{\text{test}})$ (70% train: Oct 1–21, 15% val: Oct 22–25, 15% held-out test: Oct 26–31).
- **Model Architecture:** `RandomForestRegressor(n_estimators=45, max_depth=15)` compressed with joblib (`compress=3`) to 34.4 MB (safely below GitHub's 50MB warning and 100MB hard limit).
- **Held-Out Test Set Metrics:**
  - Category Accuracy: **99.30%**
  - Category Macro-F1: **0.6787**
  - Spearman Rank Correlation ($\rho$): **0.6879** (+5.0% higher than historical median baseline)
  - MAE: **1.38 passengers**
  - WAPE: **55.46%** (beat baseline 57.17%)
- **Domain Sanity Checks:** 100% PASS (AM Peak ratio: 2.84x, PM Peak ratio: 2.48x, Weekday vs Sunday: 1.68x).

## 5. Verification & Tooling
- **One-Command Bootstrap:** `python scripts/bootstrap.py` initializes the complete system from real data.
- **Idempotent Rebuild:** `python scripts/rebuild_from_real_data.py` executes clean $\rightarrow$ reconstruct $\rightarrow$ seed $\rightarrow$ train $\rightarrow$ evaluate $\rightarrow$ verify.
- **Independent Reconciliation:** `python scripts/reconcile_raw_data.py` verified exact correspondence between raw CSV and SQLite database for 5 busy and 5 quiet routes (`docs/VALIDATION_REPORT.md`).
- **Automated Tests:** 348 / 348 E2E pytest tests PASS, 9 / 9 smoke tests PASS, 10 / 10 full website tests PASS.

## 6. Recent Polish, Telemetry & Presentation Updates (2026-11-20)
- **Hero Banner Asset Swap:** Replaced landing page right-side hero graphic with custom vector illustration of Delhi blue AC electric bus with India Gate monument background (`hero-bus-illustration.jpg`), matching modern civic aesthetics.
- **Dynamic Route Details Page:** Wired Weekday/Saturday/Sunday segmented controls and 24-hour dropdown selector into real-time reactive state. Changing either immediately recalculates stop arrival times, colored connector lines, stop crowd categories, and the 24h profile chart reference line.
- **Operating Speed Telemetry:** Integrated realistic operating speed calculations ($v = \frac{d \cdot 60}{t_{\text{ride}}}$, ~18–22 km/h) into `planner_service.py`, journey option cards (`TransitRow.jsx`), route header (`RouteDetailsPage.jsx`), itinerary overview (`JourneyItinerary.jsx`), and comparison matrix (`CompareTable.jsx`).
- **Departure Scrubber Polish:** Eliminated flickering `common.updating` string from `DepartureScrubber.jsx` for smooth instant time shifts.
- **Backend Optimization:** Resolved bottlenecks in `/api/analytics/summary`, `/api/analytics/sensitivity`, `/api/routes/<id>`, and `/api/crowd/profile/<id>` with sub-10ms in-memory caching.
- **Demo Assets:** Created comprehensive 3-minute video recording teleprompter script and graph-reading guide in `docs/DEMO_SCRIPT.md` and artifact `DEMO_SCRIPT_3MIN.md`.
