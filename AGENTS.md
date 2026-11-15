# AGENTS.md — CrowdWise Autonomy & Integrity Contract

## 0. Autonomy Contract
- Act as an autonomous senior team (full-stack, backend, data, ML, DBA, UI/UX).
- Owner is unavailable (exams). Plan, build, test, debug, and integrate autonomously.
- Read `docs/MASTER_SPEC.md` to prevent drift. Official briefs supersede prompt assumptions.
- Time-box rule: 3 different failed attempts -> simplest working alternative + log it.
- Never fake API responses, ML outputs, or integrations. "Done" means executed and tested.
- No secrets in code/logs/git. Use `.env` (commit `.env.example` only).

## 2. Transparent Data Provenance Rules (Non-Negotiable)
Every API payload and UI component displaying data must declare its provenance tier:
1. `real_public`: Delhi Buses static GTFS (routes, stops, timetables) from Delhi Transport Department.
2. `organizer`: 2.56 million authentic October 2026 ETM ticketing transactions from Delhi Transport Stack.
3. `estimated`: Any inferred or modelled values (Random Forest predictions, RCI 0–100 percentile mapping).

### Crucial Invariants
- `DATA_MODE=organizer`: persistent factual top banner with real October 2026 dates.
- GTFS times are scheduled/timetable times — never claim live or actual GPS.
- Ticket counts != passengers on board. Output is Relative Crowding Index (0–100, Low/Mod/High) + Confidence.
- Occupancy % is shown ONLY with documented nominal capacity (60 pax) AND documented expansion factor ($\gamma_r=1.30$).
- Alightings inferred under Mode B must be explicitly flagged as `estimated`.
- Hash or drop all personal identifiers (card/phone numbers) at ingestion (DPDP Act compliance).

## 4. Technology Stack
- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router, Recharts, Leaflet / react-leaflet.
- **Backend**: Python 3.12+, Flask, Flask-CORS, SQLAlchemy 2.x ORM, python-dotenv, gunicorn.
- **ML / Data**: pandas, numpy, scikit-learn (RandomForestRegressor), joblib, pyarrow (parquet), PyYAML.
- **Database**: SQLite default (`backend/crowdwise.db`), PostgreSQL via `DATABASE_URL` / `docker-compose.yml`.
- **Testing**: pytest, `scripts/smoke_test.py`, `scripts/run_sanity_checks.py`, `scripts/reconcile_raw_data.py`.

## 18. Definition of Done Checklist
- [x] Fresh clone + `python scripts/bootstrap.py` yields fully functioning system from real data.
- [x] 5 core frontend pages operational on real API data, 0 console errors, mobile (390px) responsive.
- [x] Provenance chips visible on every crowd metric; factual organizer banner active.
- [x] Direct route journey planner with 3 presets (Fastest, Balanced, Least crowded) + transparent scores.
- [x] Chronological ML split verified (`max(train) < min(val) < min(test)`) with no leakage.
- [x] Peak vs off-peak sanity checks PASS (100% GREEN).
- [x] Empty database and missing model handle gracefully without 500 errors.
- [x] `scripts/rebuild_from_real_data.py` verified end-to-end for idempotent real-data rebuilds.
- [x] Independent reconciliation verified in `docs/VALIDATION_REPORT.md`.
- [x] Hackathon pack (`PROPOSAL.md`, `TECHNICAL_NOTE.md`, `DEMO_SCRIPT.md`, `MANUAL_TODO.md`) complete.

## 19. Fork Synchronization & Conflict Prevention
- **Automatic Pull**: Always run `git pull` automatically on startup/session open without expecting manual user intervention.
- **Origin (User Fork)**: `https://github.com/chhajedyasha/transport-stack-hackathon.git`
- **Upstream (Base)**: `https://github.com/rajnyx/transport-stack-hackathon.git`
- **Sync Protocol**: Always fetch upstream (`git fetch upstream main`) and rebase cleanly before pushing to `origin main` to avoid merge conflicts with the parent repository.



