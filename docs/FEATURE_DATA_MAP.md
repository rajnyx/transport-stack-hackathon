# FEATURE_DATA_MAP.md — Feature-to-Data Grounding & Specification Map

**Project:** CrowdWise — Delhi Bus Crowdedness Journey Planner  
**Hackathon:** Transport Stack Hackathon 2026 (Problem Statement 2)  
**Authoritative Sources:** `docs/PROBLEM_BRIEF.md`, `data/raw/organizer/October-Delhi.csv`, `data/raw/gtfs/`  
**Status:** Canonical Reference Document  
**Active Data Tier:** `organizer` (Official ETM Telemetry) + `real_public` (Delhi Static GTFS)  
**Integrity Rule:** Zero synthetic, placeholder, or invented data in runtime production paths. Missing data = "Not available" or omitted.

---

## 1. Executive Summary & Grounding Architecture

CrowdWise turns empirical Electronic Ticketing Machine (ETM) records and static GTFS schedules into commuters' and transit planners' crowdedness intelligence. This document defines the exact mapping between the hackathon problem requirements (Brief Sections 1–6, Requirements R1–R4, and Features F1–F9) and the physical datasets provided by the organizers in `data/raw/`.

Every metric, badge, map polyline, and chart displayed in CrowdWise is computed by the backend directly from authentic data. Where physical data is absent (e.g., bus capacity rosters, unrecorded female Pink Pass commuters), CrowdWise parameterizes these strictly as transparent assumptions in `config/assumptions.yaml` and provides interactive what-if sensitivity analysis rather than hardcoded fictions.

---

## 2. Feature-to-Data Mapping Matrix (F1 – F9, R1 – R4)

| Feature ID | Feature Name | Exact Problem Brief Requirement (`docs/PROBLEM_BRIEF.md`) | Dataset Fields Needed | Existing Raw Fields in `data/raw/` (Exact Column Names) | Real Data Availability | Fallback / Non-Build Decision |
|---|---|---|---|---|:---:|---|
| **R1** | **Strict Data Grounding & Assumptions** | Sec 2.1, 3.1, 3.2, 5, 6: "Delhi records every bus ticket it sells... Turn ticket records into an estimate of how many people are on board... Check how your estimates hold up..." | All ticketing and GTFS timetable fields | `October-Delhi.csv`: `passenger_count`, `amount`, `vehicle_number`, `ticket_type_id`, `end_stop_name`, `route`, `start_stop_name`, `created_at`, `is_ac`. GTFS: `agency.txt`, `calendar.txt`, `calendar_dates.txt`, `feed_info.txt`, `routes.txt`, `shapes.txt`, `stops.txt`, `stop_times.txt`, `trips.txt` | **YES** | Rely strictly on organizer datasets. Zero random, simulated, or invented values anywhere. Values that cannot be computed show "Not available". All assumptions logged in `config/assumptions.yaml`. Maintain full EN/HI bilingual strings. |
| **F1** | **Confidence & Data Sparsity** | Sec 5: "Some routes and hours have few tickets. Say how much you trust your estimate there." Sec 2.1: "Turn that number into a crowding level a commuter understands..." | Ticket sample count per cell; timestamp; route identifier; passenger volume | `created_at` (IST timestamp), `route`, `passenger_count`, `start_stop_name`, `end_stop_name` in `October-Delhi.csv` | **YES** | Every crowd value displays verbal confidence: "Based on a lot of data" (ticket count $\ge 100$), "Based on some data" ($30 \le N < 100$), "Based on little data" ($10 \le N < 30$). Details view shows exact ticket sample count. Thin cells ($N < 10$) display "Not enough data" badge (`crowd.unknown`) or labelled corridor typical. Never claim confident predictions for thin data. |
| **F2** | **Bus Size & Capacity** | Sec 5: "Bus size matters. A load of 60 means different things on a 12 m and a 9 m bus." | Vehicle identifier, AC flag, vehicle length, vehicle type, rated passenger capacity | `vehicle_number` (51.48% populated, 48.52% NULL), `is_ac` (100% populated: 80.44% True, 19.56% False) in `October-Delhi.csv`. Length, type, and capacity **DO NOT EXIST** in ticket CSV or GTFS. | **PARTIAL** | Since verified capacity does not exist in raw data, **DO NOT invent capacities**. Compute Relative Crowding Index (RCI 0–100) within vehicle class (`is_ac` True vs False). Occupancy percentage (%) is **HIDDEN / shows "Not available"** in production paths. Target adjustment reported with before/after metrics using standard assumed 60-passenger capacity marked `verified: false`. |
| **F3** | **Unrecorded Riders & Sensitivity** | Sec 5: "Some riders do not appear in ticket data, such as pass holders. Decide how to account for them, and say how." | Ticket classification, pass transactions, zero-fare tickets, daily passes | `ticket_type_id` (100% = 1), `amount` (8 zero-fare rows out of 2.56M = 0.0003%, 2,559,891 positive fare rows) in `October-Delhi.csv`. Passes **DO NOT EXIST** in data. | **PARTIAL / NO** (for passes) | State factually that 100% of tickets are standard (`ticket_type_id=1`) and passes are unrecorded. **Do NOT hardcode an unrecorded factor**. Provide 4 what-if sensitivity scenarios: 0%, 10%, 20%, 30%. Data & Method page (`/about`) features an interactive Assumptions & Sensitivity section showing how top-overloaded routes shift across scenarios. |
| **F4** | **Operator Action Sheet** | Sec 2.3: "Bus operators and planners, to see which routes and hours are overloaded and where extra buses would help most. Build your outputs so both groups can read them." | Route, direction, day type, hour, scheduled trips per hour, load per trip, vehicle class, capacity, crowd level, additional trips under F3 scenarios, ticket count, confidence | `route`, `created_at`, `passenger_count`, `is_ac` from `October-Delhi.csv`; `trips.txt`, `routes.txt`, `stop_times.txt`, `calendar.txt` from GTFS; assumed capacity (60) from config | **YES** (trips/loads) / **PARTIAL** (capacity assumed) | Dedicated Analytics tab. Table ranks corridors by deficit: $\text{Deficit} = \max\left(0, \lceil \frac{\text{typical\_load} \times (1 + s) - C}{C} \times N_{\text{trips}} \rceil\right)$ for scenarios $s \in \{0\%, 10\%, 20\%, 30\%\}$. Filterable by day type, hour range, min confidence. Includes plain-language glossary and prominent indicative disclaimer. |
| **F5** | **Departure Time Scrubber** | Sec 2.2: "A third, leaving 20 minutes later, has seats. The user can see this at a glance and pick." | Scheduled trip departure times at boarding stop, crowd predictions for candidate departure windows | `stop_times.txt` (`arrival_time`, `departure_time`), `trips.txt` from GTFS; backend model predictions table (`crowd_predictions`) | **YES** | Journey Results view (`/results`) provides scrubber buttons for selected departure time and +15, +30, +45, +60 minutes. Clicking queries backend predictions and dynamically updates journey cards, crowd colors, and departure recommendations without full page reload. Offset parameter persisted in URL query string (`?offset=30`). |
| **F6** | **Stop-Level Flow** | Sec 2.1: "by route, direction, stretch between stops, and time of day". Sec 5: "group tickets by bus trip and keep a running count." | Ordered stop sequence, boarding count per stop, alighting count per stop, running passenger load, confidence | `start_stop_name`, `end_stop_name`, `passenger_count`, `route`, `created_at` in `October-Delhi.csv`; `stops.txt`, `stop_times.txt` in GTFS | **YES** | Clicking any stop in the journey timeline opens an interactive drawer/panel showing average boardings, alightings, and running onboard total for the hour band: $\text{Load}_s = \max(0, \text{Load}_{s-1} + \text{Boardings}_s - \text{Alightings}_s)$. Labeled as "ticket sample records" with explicit attribution of alighting method (Mode A: Exact O-D observed 77.3%; Mode B: Inferred alighting 11.1%), stop crowd level, and confidence. |
| **F7** | **Export & Rerun** | Sec 4.1: "A pipeline that turns raw ticket records into crowding estimates. Someone else should be able to rerun it." | Precomputed / queryable crowd predictions, route metadata, model provenance | DB `crowd_predictions`, `fact_zone_demand`, `dim_routes`, `dim_stops`; pipeline scripts `scripts/rebuild_from_real_data.py` | **YES** | CSV and JSON download triggers on `/analytics` (full network) and `/route/:routeId` (filtered corridor). Downloads include structured `# Metadata:` header block (data tier, model version, timestamp, record count, disclaimer). `README.md` documents 1-command reproducible rebuild with pinned dependencies. |
| **F8** | **Planners Crowding Map** | Sec 4.2: "Crowding outputs that can be queried or shown on a map, by route, stretch and time of day." | Road geometry polylines, stop coordinates, corridor crowd level per day type and hour | GTFS `shapes.txt` (`shape_pt_lat`, `shape_pt_lon`, `shape_pt_sequence`), `stops.txt` (`stop_lat`, `stop_lon`); backend route predictions | **YES** | Analytics corridor map rendering Leaflet polylines colored by crowd level (Green: Low, Amber: Moderate, Red: High) for user-selected day type and hour. Smooth rendering guaranteed by lazy-loading and capping polyline rendering (top 50 active corridors / corridor filter). |
| **F9** | **Boarding-Stop Advice (Stretch)** | Sec 2.1: "Let the user choose between a faster trip and a more comfortable one." Sec 2.2: "The user can see this at a glance and pick." | Stop sequence along route, stop coordinates, walking distance to upstream stop, upstream crowd level | GTFS `stops.txt` (`stop_lat`, `stop_lon`, `stop_name`), `stop_times.txt` (`stop_sequence`); backend zone/stop predictions | **YES** | If selected boarding stop has Moderate or High crowd, check preceding stop on route pattern. If walking distance $\le 400\text{m}$ ($\le 5\text{ min}$) and upstream stop has lower crowd level with Medium/High confidence, show advice banner: "Tip: Walk [X] m to [Earlier Stop] for seats available." If crowd does not differ, distance $> 400\text{m}$, or confidence is Low, advice is **suppressed/hidden**. |

---

## 3. Empirical Data Audit & Quality Verification

### 3.1 Ticketing Dataset: `October-Delhi.csv`
- **Location:** `data/raw/organizer/October-Delhi.csv` (290,014,457 bytes / 276.58 MB)
- **Total Records:** **2,559,899 rows** (all 31 days of October 2026)
- **Timezone:** `Asia/Kolkata` (`+05:30`), microsecond precision timestamps.
- **Data Quality Assertions:**
  - `passenger_count`: `int64`, 0.00% null. Distribution: 1 (93.44%), 2 (5.54%), 3 (1.01%), 6 (1 record). Total passengers = 2,753,606.
  - `amount`: `float64`, 0.00% null. Exactly 8 rows out of 2,559,899 have `amount == 0.0` (all on route `GMS(+)UP`, vehicle_number NaN, ticket_type_id 1). Remaining 2,559,891 rows have positive fares.
  - `vehicle_number`: `string`, 48.52% null (1,242,167 nulls, 1,317,732 populated). Registration patterns conform to DTC/DIMTS formats (e.g. `DL1PD6826`).
  - `ticket_type_id`: `int64`, 0.00% null. **100.00% of rows have ticket_type_id == 1**. No pass codes, student concession codes, or pink tickets exist in the dataset.
  - `start_stop_name`: `string`, 0.00% null (5,612 distinct names).
  - `end_stop_name`: `string`, 0.00% null (5,761 distinct names).
  - `route`: `string`, 0.00% null (2,020 distinct strings, e.g. `8UP`, `102ADOWN`, `433UP`).
  - `is_ac`: `boolean`, 0.00% null. True: 2,059,092 (80.44%), False: 500,807 (19.56%). Strong e-ticketing adoption skew towards AC fleet.
  - **Vehicle Capacity / Length / Type Columns:** **DO NOT EXIST**.

### 3.2 Transit Schedule: Delhi Static GTFS Feed (`data/raw/gtfs/`)
- `stops.txt`: 6,862 stops with WGS84 coordinates. All stops bounded within Delhi NCR envelope ($28.3^\circ\text{N} - 29.0^\circ\text{N}, 76.7^\circ\text{E} - 77.5^\circ\text{E}$).
- `routes.txt`: 2,574 routes. `route_short_name` embeds direction (`UP` / `DOWN`). 98.31% of ticket transaction route strings match GTFS routes directly.
- `trips.txt`: 80,357 scheduled trips.
- `stop_times.txt`: 2,737,136 stop sequence records.
- `shapes.txt`: 965,607 shape coordinate points for polyline mapping.
- `calendar.txt` & `calendar_dates.txt`: Daily baseline schedule with Gandhi Jayanti (2026-10-02) national holiday exception.
- **Vehicle Capacity / Length / Type Columns:** **DO NOT EXIST** in GTFS.

### 3.3 Stop-Level Boarding / Alighting Matching Funnel (F6)
- **Mode A (Exact Origin-Destination Observed):** 1,979,418 records (**77.32%**). Both origin stop and destination stop match ordered sequence ($s_{\text{board}} < s_{\text{alight}}$) along the GTFS pattern.
- **Mode B (Inferred Alightings):** 283,240 records (**11.06%**). Origin stop verified on route; destination inferred using reverse-direction travel symmetry and distance-decay gravity model.
- **Macro Network Retained:** 297,241 records (**11.61%**). Unmatched colloquial terminal strings retained for network demand aggregates; excluded from stop-level flow to prevent bias.
- **Stop-Level Flow Feasibility:** **CONFIRMED 100% FEASIBLE**. 88.38% of all ticket records provide verified boarding stop locations on transit routes.

---

## 4. Canonical Assumptions Registry (`config/assumptions.yaml`)

Every assumption required across F1–F9 is catalogued below with its unique ID, parameter value, authoritative source, and evidentiary status:

| Assumption ID | Parameter Name | Value | Authoritative Source | Evidentiary Status | Role in Features |
|---|---|---|---|---|---|
| `ASM-01` | `bus_capacity_standard` | 60 passengers (40 seated + 20 standing) | DTC 12-meter Low-Floor CNG Bus Specifications | `our assumption` | F2 (Capacity baseline), F4 (Action Sheet deficit calculation) |
| `ASM-02` | `bus_capacity_ac` | 55 passengers | DTC AC Low-Floor Fleet Guidelines | `our assumption` | F2 (AC vehicle class crowding), F4 |
| `ASM-03` | `bus_capacity_midi` | 35 passengers | DTC / DIMTS Midi feeder bus standard | `our assumption` | F2 (Feeder vehicle class) |
| `ASM-04` | `bus_capacity_verified` | `false` | Dataset audit: zero capacity fields in `October-Delhi.csv` or GTFS | `from data` | F2 (Enforces hiding occupancy % in production) |
| `ASM-05` | `unrecorded_rider_scenarios` | `[0.00, 0.10, 0.20, 0.30]` (0%, 10%, 20%, 30%) | Problem Brief Sec 5 & Task Specification F3 | `from brief` | F3 (Sensitivity analysis), F4 (Action Sheet scenario columns) |
| `ASM-06` | `unrecorded_rider_default` | 0.00 (+0% unrecorded, raw ticket baseline) | Strict data grounding rule: no invented volume | `our assumption` | F1, F2, F3 |
| `ASM-07` | `pink_pass_expansion_factor` | 1.30 (+30% load) | Delhi Transport Dept female ridership share audit under Mukhyamantri Mahila Yatra Yojana | `our assumption` | F3 (Sensitivity ceiling scenario), F6 (Reconstruction safeguard) |
| `ASM-08` | `confidence_high_min_tickets` | 100 tickets | Empirical distribution of ticket volume per route-hour in `October-Delhi.csv` | `from data` | F1 (Confidence labeling: "Based on a lot of data") |
| `ASM-09` | `confidence_medium_min_tickets`| 30 tickets | Empirical distribution of ticket volume per route-hour in `October-Delhi.csv` | `from data` | F1 (Confidence labeling: "Based on some data") |
| `ASM-10` | `confidence_low_min_tickets` | 10 tickets | Empirical distribution of ticket volume per route-hour in `October-Delhi.csv` | `from data` | F1 (Confidence labeling: "Based on little data") |
| `ASM-11` | `data_sparsity_thin_threshold` | < 10 tickets | Statistical threshold for unrepresentative samples | `from data` | F1 (Display "Not enough data" badge) |
| `ASM-12` | `rci_low_percentile` | < P40 | Empirical load distribution across 3.32M zone demand facts | `from data` | F1, F2, F8 (Seats Available category) |
| `ASM-13` | `rci_moderate_percentile` | P40 – P75 | Empirical load distribution across 3.32M zone demand facts | `from data` | F1, F2, F8 (Standing Room category) |
| `ASM-14` | `rci_high_percentile` | $\ge$ P75 | Empirical load distribution across 3.32M zone demand facts | `from data` | F1, F2, F8 (Crowded category) |
| `ASM-15` | `walking_speed_kph` | 4.5 km/h (75 m/min) | Transit planning pedestrian speed standard | `our assumption` | Journey Planner walk times |
| `ASM-16` | `walking_detour_factor` | 1.30 | Urban grid / pedestrian street network factor over Haversine distance | `our assumption` | Journey Planner walk times |
| `ASM-17` | `walking_catchment_direct_m` | 500 meters | Standard urban bus stop walking radius | `our assumption` | Journey Planner candidate stop discovery |
| `ASM-18` | `walking_catchment_wider_m` | 800 meters | Extended walking radius option | `our assumption` | Journey Planner "Search wider" option |
| `ASM-19` | `f9_earlier_stop_max_walk_m` | 400 meters ($\le 5\text{ min}$) | Maximum acceptable walk for boarding trade-off | `our assumption` | F9 (Boarding-stop advice threshold) |
| `ASM-20` | `f9_min_confidence_for_advice` | `medium` | F9 Requirement: hide advice if confidence is low | `from brief` | F9 (Suppression guardrail) |
| `ASM-21` | `mode_a_matching_rate` | 77.32% | Exact stop sequence mapping in `October-Delhi.csv` | `from data` | F6 (Flow attribution label) |
| `ASM-22` | `mode_b_inference_method` | Reverse-direction symmetry + distance decay | Problem Brief Sec 5 & Master Spec Sec 8 | `our assumption` | F6 (Flow attribution label) |
| `ASM-23` | `holiday_calendar_override` | Gandhi Jayanti (2026-10-02) mapped to Sunday schedule | Observed volume drop to 53,923 boardings (41.8% of Friday) | `from data` | Calendar Day Type mapping |

---

## 5. Feature Execution Specifications

### 5.1 F4: Operator Action Sheet Specifications
- **Tab Location:** `/analytics` page under the "Action Sheet" tab.
- **Data Grain:** One row per `(route_id, direction, day_type, hour)`.
- **Columns:**
  1. `Route & Direction`: e.g. `102A UP` (Rohini Sec 22 $\rightarrow$ Azadpur)
  2. `Day Type`: Weekday / Saturday / Sunday
  3. `Hour Band`: e.g. `08:00 – 09:00`
  4. `Scheduled Trips / hr` ($N_{\text{trips}}$): from GTFS timetable
  5. `Typical Load / trip` ($\hat{L}$): Reconstructed passenger load divided by scheduled trips
  6. `Vehicle Class / Capacity`: AC Low-Floor ($C = 55$) or Standard ($C = 60$)
  7. `Crowd Level`: Low / Moderate / High badge
  8. `Indicative Additional Trips (+0%)`: $\max(0, \lceil \frac{\hat{L} - C}{C} \times N_{\text{trips}} \rceil)$
  9. `Indicative Additional Trips (+10%)`: $\max(0, \lceil \frac{\hat{L} \times 1.10 - C}{C} \times N_{\text{trips}} \rceil)$
  10. `Indicative Additional Trips (+20%)`: $\max(0, \lceil \frac{\hat{L} \times 1.20 - C}{C} \times N_{\text{trips}} \rceil)$
  11. `Indicative Additional Trips (+30%)`: $\max(0, \lceil \frac{\hat{L} \times 1.30 - C}{C} \times N_{\text{trips}} \rceil)$
  12. `Confidence & Samples`: Verbal badge ("Based on a lot of data") + ticket count (e.g. `342 tickets`)
- **Ranking:** Default sorted in descending order of passenger deficit under the active scenario.
- **Controls & Filters:**
  - Day Type filter: All, Weekday, Saturday, Sunday
  - Hour Range slider: 06:00 to 22:00
  - Min Confidence dropdown: All, Medium+, High only
  - Scenario Selector: 0%, 10%, 20%, 30%
- **Glossary & Indicative Disclaimer:**
  - *Deficit:* Estimated passenger demand exceeding rated vehicle capacity across scheduled trips.
  - *Indicative Trips:* Additional departures required per hour to bring typical load below seated capacity.
  - *Disclaimer:* "Indicative transit planning estimate derived from October 2026 ETM ticket samples. Not an operational dispatch instruction. Vehicle capacities and unrecorded passenger rates represent sensitivity parameters."

### 5.2 F5: Departure Time Scrubber Specifications
- **View Location:** `/results` journey option cards.
- **Controls:** Time scrubber bar displaying 5 buttons: `Selected Departure`, `+15 min`, `+30 min`, `+45 min`, `+60 min`.
- **Interaction:**
  - Clicking any offset button recalculates candidate options for $(T_{\text{depart}} + \Delta t)$ via backend API without reloading the page.
  - URL synchronizes state immediately (`?from=...&to=...&time=18:00&offset=30`).
  - Journey cards update crowd level badges, travel duration, and departure recommendation tips dynamically.
  - Active button highlighted with accessible focus ring and aria-pressed state.

### 5.3 F6: Stop-Level Flow Specifications
- **View Location:** Stop timeline on `/results` (JourneyItinerary) and `/route/:routeId` (RouteTimeline).
- **Interaction:** Clicking any stop circle or stop name row opens an expandable drawer / popover.
- **Metrics Displayed:**
  - `Average Boardings`: e.g. `42 passengers / hr` (sample tickets)
  - `Average Alightings`: e.g. `38 passengers / hr` (sample tickets)
  - `Running Onboard Total`: e.g. `34 passengers on board`
  - `Stop Crowd Level`: Low / Moderate / High badge
  - `Data Confidence`: Verbal confidence rating + exact sample ticket count
  - `Estimation Methodology Attribution`: "Sample tickets from official ETM data. Boardings: 100% observed. Alightings: 77.3% observed destination (Mode A), 11.1% gravity inferred (Mode B). Satisfies $\text{Load}_s = \max(0, \text{Load}_{s-1} + \text{Boardings} - \text{Alightings})$."

### 5.4 F8: Planners Crowding Map Specifications
- **View Location:** `/analytics` page under the "Crowding Map" tab.
- **Controls:**
  - Day Type selector: Weekday, Saturday, Sunday
  - Hour of Day selector: 00:00 to 23:00 (slider + number input)
  - Active Fleet Filter: All, AC Only, Non-AC Only
- **Map Behavior:**
  - Renders Leaflet OpenStreetMap base layer with road-following polylines derived from GTFS `shapes.txt`.
  - Polylines colored by predicted segment crowd level: Emerald Green (`#22A06B`, Low), Warm Amber (`#F5A623`, Moderate), Crimson Red (`#E5484D`, High).
  - Polyline thickness scales with scheduled trip frequency.
  - Hovering/clicking a corridor segment reveals tooltip: Route short name, stretch start/end stops, predicted RCI index, verbal confidence, ticket sample count.
  - Smooth rendering guardrail: Polylines capped to top 50 corridors by volume with lazy loading on map viewport bounds.

### 5.5 F9: Boarding-Stop Advice (Stretch) Specifications
- **View Location:** Journey option card on `/results`.
- **Trigger Condition:**
  1. Commuter's matched boarding stop has predicted crowd level `Moderate` or `High`.
  2. The immediate upstream stop ($s-1$) along the identical route pattern has predicted crowd level `Low` (or strictly lower than stop $s$).
  3. Haversine walking distance from commuter's origin to upstream stop $s-1$ is $\le 400\text{ meters}$.
  4. Upstream stop prediction confidence is `Medium` or `High`.
- **Display UI:** Renders a highlighted tip banner inside the journey card:
  - *"Tip: Walk [X] meters to [Earlier Stop Name] for seats available (departure [HH:MM])."*
- **Suppression Invariants:** Advice is **strictly hidden** if:
  - Crowd level at upstream stop is equal to or worse than current stop.
  - Walking distance exceeds 400 meters.
  - Confidence at upstream stop is `Low` or `Not enough data`.

---

## 6. Bilingual Localization Matrix (EN / HI)

All displayed text strings across F1–F9 are catalogued in `frontend/src/i18n/en.json` and `hi.json`:

| Feature | Key Path | English String (`en.json`) | Hindi String (`hi.json`) |
|---|---|---|---|
| **F1** | `confidence.high` | "Based on a lot of data" | "काफ़ी डेटा पर आधारित" |
| **F1** | `confidence.medium` | "Based on some data" | "कुछ डेटा पर आधारित" |
| **F1** | `confidence.low` | "Based on little data" | "कम डेटा पर आधारित" |
| **F1** | `crowd.unknown` | "Not enough data" | "पर्याप्त डेटा नहीं" |
| **F1** | `results.sampleCount` | "Based on {{count}} ticket records" | "{{count}} टिकट रिकॉर्ड पर आधारित" |
| **F2** | `f2.occupancyUnavailable` | "Occupancy percentage not available (bus capacity unverified in data)" | "सवारियों का प्रतिशत उपलब्ध नहीं है (डेटा में बस क्षमता सत्यापित नहीं है)" |
| **F3** | `f3.sensitivityTitle` | "Assumptions and sensitivity" | "मान्यताएं और संवेदनशीलता विश्लेषण" |
| **F3** | `f3.scenario` | "{{pct}}% unrecorded riders" | "{{pct}}% अदर्ज यात्री" |
| **F4** | `actionSheet.title` | "Operator Action Sheet" | "संचालक कार्य योजना (एक्शन शीट)" |
| **F4** | `actionSheet.deficit` | "Passenger Deficit" | "यात्री घाटा (अतिरिक्त मांग)" |
| **F4** | `actionSheet.indicativeTrips` | "Indicative extra trips / hr" | "संकेतक अतिरिक्त बसें / घंटा" |
| **F4** | `actionSheet.disclaimer` | "Indicative planning estimate based on October 2026 ETM ticket sample. Not a live dispatch instruction." | "अक्टूबर 2026 ईटीएम टिकट नमूने पर आधारित सांकेतिक योजना अनुमान। यह लाइव प्रेषण निर्देश नहीं है।" |
| **F5** | `scrubber.selected` | "Selected time" | "चयनित समय" |
| **F5** | `scrubber.plus15` | "+15 min" | "+15 मिनट" |
| **F5** | `scrubber.plus30` | "+30 min" | "+30 मिनट" |
| **F5** | `scrubber.plus45` | "+45 min" | "+45 मिनट" |
| **F5** | `scrubber.plus60` | "+60 min" | "+60 मिनट" |
| **F6** | `flow.title` | "Stop passenger flow" | "स्टॉप यात्री प्रवाह" |
| **F6** | `flow.boardings` | "Avg boardings / hr" | "औसत चढ़ने वाले / घंटा" |
| **F6** | `flow.alightings` | "Avg alightings / hr" | "औसत उतरने वाले / घंटा" |
| **F6** | `flow.onboard` | "Running onboard total" | "बस में कुल सवार यात्री" |
| **F6** | `flow.attribution` | "Ticket sample records (Mode A observed / Mode B inferred)" | "टिकट नमूना रिकॉर्ड (मोड A प्रेक्षित / मोड B अनुमानित)" |
| **F7** | `export.csv` | "Export CSV" | "सीएसवी डाउनलोड करें" |
| **F7** | `export.json` | "Export JSON" | "जेसन डाउनलोड करें" |
| **F8** | `map.title` | "Corridor crowding map" | "मार्ग भीड़ का नक्शा" |
| **F8** | `map.hour` | "Select hour of day" | "दिन का समय चुनें" |
| **F9** | `advice.walkEarlier` | "Tip: Walk {{dist}} m to {{stop}} for seats available" | "सुझाव: खाली सीट के लिए {{dist}} मीटर पैदल {{stop}} जाएं" |

---

## 7. Action Checklist for `docs/MANUAL_TODO.md`

1. **Native Speaker Proofreading for New Bilingual Keys:**
   - Verify colloquial accuracy of Hindi translations for F4 Operator Action Sheet terms (*यात्री घाटा*, *संकेतक अतिरिक्त बसें*) and F6 Stop Flow terms (*यात्री प्रवाह*, *चढ़ने वाले*, *उतरने वाले*).
2. **Recorded Demo Walkthrough:**
   - Follow `docs/DEMO_SCRIPT.md` to demonstrate the F4 Action Sheet scenario toggle, F5 Scrubber offset persistence, F6 Stop Flow popover, and F8 Leaflet Corridor Map.
3. **Written Proposal & Submission:**
   - Open `docs/PROPOSAL.md` (or HTML version), attach team credentials, and upload to the hackathon portal before the deadline.
