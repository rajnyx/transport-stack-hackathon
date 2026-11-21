# CrowdWise — Delhi Crowdedness-Aware Bus Journey Planner

**Delhi Transport Stack Hackathon 2026 — Track 2: Passenger Demand & Crowdedness Modeling**

> *A full-stack bus journey planner for Delhi that tells commuters how crowded their bus will be — not just when it arrives.*

[![Smoke Tests](https://img.shields.io/badge/Smoke%20Tests-14%2F14%20PASS-brightgreen.svg)]()
[![Regression Tests](https://img.shields.io/badge/Pytest-732%2F732%20PASS-brightgreen.svg)]()
[![Full-Stack Verification](https://img.shields.io/badge/Full--Stack%20E2E-10%2F10%20PASS-brightgreen.svg)]()
[![Domain Checks](https://img.shields.io/badge/Sanity%20Checks-100%25%20PASS-brightgreen.svg)]()
[![ML Metric](https://img.shields.io/badge/Spearman%20Rank-0.6879-blue.svg)]()
[![DPDP Act](https://img.shields.io/badge/DPDP%20Act%202023-Compliant-emerald.svg)]()

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [What CrowdWise Does](#2-what-crowdwise-does)
3. [Live Demo — The Canonical Showcase Route](#3-live-demo--the-canonical-showcase-route)
4. [Architecture & Data Engineering](#4-architecture--data-engineering)
5. [Quickstart & Local Setup](#5-quickstart--local-setup)
6. [Complete Feature Tour (Every Page Explained)](#6-complete-feature-tour-every-page-explained)
7. [Every Chart & Metric Explained](#7-every-chart--metric-explained)
8. [Machine Learning & Validation Scorecard](#8-machine-learning--validation-scorecard)
9. [REST API Catalog](#9-rest-api-catalog)
10. [Key Terminology Glossary](#10-key-terminology-glossary)
11. [Submission Documentation Pack](#11-submission-documentation-pack)
12. [License](#12-license)

---

## 1. The Problem

Every day, over **4 million passenger trips** are taken across Delhi's public bus fleet. But apps like Google Maps or One Delhi rank buses **only by travel time** — they have no idea how crowded a bus will be.

The result: commuters board packed buses blind, while a less crowded bus on a parallel route — or the same route 15 minutes later — goes underused.

### Why is this hard?
Delhi buses do not have passenger sensors or automated door-tap systems. The only record of who rides a bus is the **Electronic Ticketing Machine (ETM)** — the handheld device conductors carry. When a commuter buys a ticket or shows a pass, the ETM records the timestamp, boarding stop, fare stage, and vehicle. But **alightings are never recorded** — no one scans out.

CrowdWise solves this by:
1. Using **2.56 million ETM transactions from October 2026** to reconstruct historical passenger demand stop-by-stop.
2. Training a **Random Forest ML model** to predict crowding for any route, hour, and day type.
3. Presenting these predictions alongside official GTFS timetables so commuters can make an informed trade-off between **speed and comfort**.

---

## 2. What CrowdWise Does

CrowdWise is a **5-page React web application** backed by a **Flask REST API** and an **SQLite transit database**. It gives commuters three things no existing Delhi transit app offers:

| Feature | Description |
|---|---|
| 🕐 **Crowdedness-Aware Journey Planning** | Shows how crowded each bus option will be — not just how long it takes |
| ⏱️ **Departure Time Scrubber** | Lets you shift your departure by 0/+15/+30/+45/+60 minutes to find a less crowded bus |
| 📊 **24-Hour Route Profiles** | Shows the crowding curve for any Delhi bus route across the entire day, weekday vs weekend |
| 🗺️ **Live Corridor Crowding Map** | Color-coded Leaflet map showing all Delhi corridors by crowding level at any hour |
| 📋 **Operator Action Sheet** | Tells transit planners exactly which corridors need extra buses and when |
| 🔍 **Stop-by-Stop Flow Drawer** | Shows boardings, alightings, and running passenger count at every stop on a route |

---

## 3. Live Demo — The Canonical Showcase Route

**Anand Vihar ISBT → Connaught Place (Shivaji Stadium), 6:00 PM Weekday**

| Option | Bus Route | Distance / Speed | Travel Time | Crowding Level | RCI Score | Why Choose This? |
|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Option 1 (Fastest)** | Route 101UP Direct | 13.4 km (~21 km/h) | **45 min** | **Very Crowded** | **88 / 100** | Fastest arrival, but packed through the middle stretch — evening peak rush |
| **Option 2 (Balanced)** | Route 85UP Regular | 14.8 km (~19 km/h) | **55 min** | **Fairly Crowded** | **68 / 100** | +10 min commute, comfortable standing space throughout the journey |
| **Option 3 (Least Crowded)** | Route 73UP (Departs +15m) | 13.4 km (~20 km/h) | **65 min** | **Not Crowded** | **34 / 100** | Guaranteed seat — ideal for elderly passengers, luggage, or long rides |

> **CrowdWise insight:** The 6 pm weekday peak on this corridor is real. Ticket data confirms the evening rush (5–7 pm) is **2.48× busier** than midday. Waiting just 15 minutes drops the crowding level by one full tier.

---

## 4. Architecture & Data Engineering

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DELHI TRANSPORT STACK DATA INGESTION                 │
│  • October 2026 ETM Telemetry (2.56M records, 9 columns)              │
│  • Static GTFS Timetables (Stops, Routes, Shapes, Trips)               │
└───────────────────┬────────────────────────────────────┬───────────────┘
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       ETM PROFILER & PARSER          │  │     TRANSIT GRAPH LAYER      │
│  • Mode A: Exact O-D (October Feed)  │  │  • 8-Zone Corridor Partition │
│  • Mode B: Hybrid Alighting Engine   │  │  • cKDTree Spatial Search    │
│  • Mode C: Hare-Niemeyer Disagg.     │  │  • Levenshtein Fuzzy Match   │
└───────────────────┬──────────────────┘  └──────────────┬───────────────┘
                    │                                    │
                    ▼                                    │
┌──────────────────────────────────────┐                 │
│   PRIVACY & RECONSTRUCTION ENGINE    │                 │
│  • DPDP Salted HMAC-SHA-256 Hashing  │                 │
│  • Running Mass Conservation:        │                 │
│    L_s = L_{s-1} + b_s - a_s         │                 │
│  • Terminal Clearance: L_end = 0     │                 │
└───────────────────┬──────────────────┘                 │
                    │                                    │
                    ▼                                    │
┌──────────────────────────────────────┐                 │
│   MACHINE LEARNING & CALIBRATION     │                 │
│  • Chronological Split (70/15/15)    │                 │
│  • Leakage-Safe Feature Pipeline     │                 │
│  • CrowdRandomForestRegressor        │                 │
│  • RCI Calibration (0–100 Rank)      │                 │
└───────────────────┬──────────────────┘                 │
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CROWDWISE API & PLANNER                           │
│  • Multi-Objective Optimization: Score = w_time·ΔT + w_crowd·RCI      │
│  • Detour Safety Cap: T ≤ 1.5·T_fastest + 10 min                      │
│  • Four Data Tiers Provenance Metadata Envelopes                       │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      MODERN REACT / VITE FRONTEND                      │
│  • 5-Page Application with Color-Blind Safe UI Tokens                  │
│  • Interactive Leaflet Maps & Polyline Route Alignment                 │
│  • 24-Hour Diurnal Recharts (Weekday vs Weekend dual curves)           │
│  • English & हिन्दी Bilingual Localization                              │
│  • Departure Scrubber, Stop Flow Drawer, Operator Action Sheet         │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Pipeline Details

| Stage | What Happens | Output |
|---|---|---|
| **GTFS Ingest** | Loads 6,862 stops, 2,574 routes, 3,498 trip patterns, stop times, and shape geometries | `DimStops`, `DimRoutes`, `DimTrips`, `StopTimes` tables |
| **ETM Processing** | Parses 2.56M conductor transactions; maps fare stages to stop IDs using fuzzy + spatial matching | Boarding facts per stop per trip |
| **Alighting Estimation** | Mode A (observed O-D when available), Mode B (hybrid gravity model), Mode C (Hare-Niemeyer proportional disaggregation) | Alighting probability per stop |
| **Load Reconstruction** | Running mass conservation: `L_s = L_{s-1} + boardings_s − alightings_s`, terminal clearance enforced | 3.32M `SegmentCrowdFacts` rows |
| **ML Training** | CrowdRandomForestRegressor on 70% chronological train split; tested on Oct 26–31 held-out period | Model weights + RCI scaler |
| **Privacy** | Passenger IDs salted with HMAC-SHA-256 (DPDP Act 2023 compliance); raw PII never stored | Anonymized analytics |

---

## 5. Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm 9+

### Step 1 — Clone & Bootstrap
```bash
git clone https://github.com/rajnyx/transport-stack-hackathon.git
cd transport-stack-hackathon

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the complete data pipeline bootstrap
python scripts/bootstrap.py
```

> `bootstrap.py` automatically initializes SQLite schemas, ingests official Delhi static GTFS (6,862 stops, 2,574 routes), processes 2.56M October ETM tickets, seeds 3.32M demand facts, and verifies system readiness.

### Step 2 — Run Verification
```bash
python scripts/smoke_test.py
# → SUCCESS: ALL 14 SMOKE TESTS PASSED!

python scripts/verify_full_website.py
# → ALL 10 FULL-STACK VERIFICATION CHECKS PASSED WITH ZERO ERRORS!
```

### Step 3 — Start the Application

**Option A: Unified Full-Stack (Flask serves compiled React)**
```bash
cd frontend && npm install && npm run build && cd ..
python wsgi.py
# Open http://localhost:5000
```

**Option B: Development Mode (Hot Reload)**
```bash
# Terminal 1 — Backend API (port 5000)
python backend/run.py

# Terminal 2 — React Frontend (port 3000)
cd frontend && npm install && npm run dev
# Open http://localhost:3000
```

### Key URLs to Open
| URL | What You'll See |
|---|---|
| `http://localhost:3000/` | Homepage — Journey Planner |
| `http://localhost:3000/results?origin_id=8256&dest_id=365&departure_time=18:00&preference=balanced` | Anand Vihar → CP Results (the showcase route) |
| `http://localhost:3000/route/101UP` | Route 101UP 24-Hour Profile |
| `http://localhost:3000/analytics` | Network Analytics Dashboard |
| `http://localhost:3000/about` | Data & Method Transparency |
| `http://127.0.0.1:5000/api/health` | API Health Check (JSON) |

### Pinned Dependencies

| Backend (Python 3.10+) | Version | Frontend (Node 18+) | Version |
|:---|:---|:---|:---|
| `flask` | `3.0.3` | `react` | `18.3.1` |
| `flask-cors` | `4.0.1` | `react-dom` | `18.3.1` |
| `sqlalchemy` | `2.0.36` | `react-router-dom` | `6.28.0` |
| `pandas` | `2.2.3` | `leaflet` | `1.9.4` |
| `numpy` | `1.26.4` | `react-leaflet` | `4.2.1` |
| `scikit-learn` | `1.5.2` | `recharts` | `2.13.3` |
| `scipy` | `1.14.1` | `lucide-react` | `0.460.0` |
| `joblib` | `1.4.2` | `vite` | `5.4.21` |
| `pyarrow` | `17.0.0` | `tailwindcss` | `4.0.0` |
| `pyyaml` | `6.0.2` | `i18next` | `23.16.8` |
| `pytest` | `8.3.3` | `gunicorn` | `23.0.0` |

---

## 6. Complete Feature Tour (Every Page Explained)

### Page 1 — Journey Planner (`/`)

The homepage opens straight to the planning tool — no marketing splash, no onboarding flow.

#### Stop Search (`StopCombobox`)
- Typeahead search across all **6,862 Delhi bus stops** with instant results.
- Recognizes **colloquial shorthand**: typing `CP` finds *Connaught Place / Shivaji Stadium Terminal*; `ISBT` finds both *Anand Vihar ISBT* and *Kashmere Gate*; `AIIMS` and `NDLS` resolve correctly.
- When focused with an empty input, instantly shows a **"Suggested Major Transit Hubs"** list — Delhi's 8 highest-volume interchanges for quick selection.
- Both origin and destination have identical search functionality.

#### Swap Button (⇅)
- Single tap to instantly interchange origin and destination.
- Minimum 44px touch target for easy use while standing on a moving bus.

#### Departure Time
- Toggle between **"Leave now"** (uses your current device clock) and **"Leave at"** with an accessible time picker.
- Defaults show the 6:00 PM peak scenario for the demo.

#### Journey Priority
Three modes, selectable via a segmented control:
- **Fastest** — Ranks purely by minimum total travel minutes. No crowding penalty.
- **Balanced (default)** — Multi-objective score: `Score = Duration + (RCI × 0.25)`. Finds routes where a few extra minutes buys substantial comfort improvement.
- **Least Crowded** — Prioritizes routes with the lowest crowding index, regardless of time cost. Best for elderly commuters, passengers with luggage, or anyone who needs a seat.

Your preference is **remembered across sessions** via `localStorage`.

#### Quick Showcase Button
One-click button: **"Try corridor: Anand Vihar → Connaught Place (6:00 pm)"** — pre-fills and executes the primary demo route.

#### Recent Searches
Automatically stores your last 5 searches. Tap any to re-run in one second. Tap "Clear recent" to wipe local history. Data never leaves your device.

---

### Page 2 — Journey Results (`/results`)

Displays all ranked bus journey options for your search, with a full interactive map and itinerary.

#### Header Bar
Shows `Origin → Destination` with departure time and the **data honesty disclaimer**: *"Based on past ticket data for this time of day."* Includes back button and sorting controls.

#### Sorting Controls
Three toggle pills — **Fastest / Balanced / Least Crowded** — instantly re-rank all options without a new API call.

#### Journey Option Cards (`TransitRow`)
Each option card shows:
- **Route Badge** — Bold high-contrast navy badge (e.g., `73UP`, `85DOWN`, `943UP`).
- **Departure time** — Scheduled time formatted in 12-hour AM/PM.
- **Total travel duration** — The largest, most prominent number on the card (e.g., `40 min`).
- **Distance & stop count** — Corridor distance in km + total stops on the ride.
- **Crowding at your boarding stop** — What to expect when you arrive at the stop.
- **Busiest stretch of the ride** — The worst crowding you'll encounter during the trip.
- **Why this route?** — Expandable popover explaining the exact scoring formula for why this option ranked here.

#### Departure Time Scrubber (`DepartureScrubber`)
Five buttons: **Now / +15m / +30m / +45m / +60m** (showing the resulting time under each button, e.g., `6:15 pm`). Clicking any button instantly re-fetches the journey plan for that shifted departure time, showing updated crowding levels. This is CrowdWise's most powerful commuter feature — finding a less crowded bus by leaving slightly later.

#### Preference Filter on Results Page
The Fastest / Balanced / Least Crowded segmented control also appears on the results page, letting you re-sort without going back.

#### Compare Top 3 (`CompareTable`)
A side-by-side matrix of the top three options showing:
- Total Travel Time, Walking Time, Waiting Time, Ride Time
- Crowding at Boarding, Busiest Stretch, Data Confidence, Transfers
- **Automatic badges**: dark navy "Fastest" badge on the minimum-duration option; teal "Least crowded" badge on the lowest-RCI option.
- Tapping a column selects that route and highlights it on the map.

#### Interactive Route Map (`LeafletRouteMap`)
- OpenStreetMap base with a **dual-cased polyline** (6px deep navy casing + 3.5px pine teal core) for maximum visibility over Delhi's complex street grid.
- **Custom stop markers**: large teal for boarding, large navy for alighting, small white for intermediates.
- **Tap any stop pin** to open its popup: stop name, stop ID, sequence number, distance from origin, scheduled time.
- Auto-fits and zooms to frame the selected corridor whenever you switch options.
- Shows an amber **"Approximate path"** notice if GTFS shape data is unavailable for a secondary route.

#### Stop-by-Stop Itinerary Timeline (`JourneyItinerary`)
Moovit-style vertical timeline showing the complete journey:
- Route badge, departure-to-arrival time span, total minutes, operator (DTC), corridor distance, crowd level.
- **Boarding stop** (teal circle): stop name, scheduled departure, Stop ID.
- **Intermediate stops** (expandable): tap to reveal all intermediate stops with sequence number, stop name, cumulative distance from start, and estimated arrival time (e.g., `+1.8 km · 6:04 pm`).
- **Alighting stop** (navy square): final arrival time and total distance.
- **Speed & fare advisory** at the bottom: estimated corridor operating speed (~18 km/h) and pass validity (DTC Daily / Pink Pass).

#### 24-Hour Route Profile Chart (on Results page)
Shown below the itinerary for the selected route — the same weekday vs. weekend dual-curve area chart from the Route Details page, so you can understand the pattern for the entire day.

#### Stop Flow Drawer (`StopFlowDrawer`)
Tap any stop in the itinerary to open a bottom drawer panel showing:
- Stop name, sequence number, hour and day type being inspected.
- **Boardings** at this stop (how many passengers get on).
- **Alightings** at this stop (estimated, since Delhi ETMs don't record exits).
- **Running passenger load** on the bus after this stop.
- Data attribution mode (Mode A = observed origin-destination, Mode B = inferred alightings).
- Confidence rating and sample ticket count.

---

### Page 3 — Route Details & 24-Hour Profile (`/route/:id`)

Deep-dive page for any individual Delhi bus route (e.g., `/route/73UP`, `/route/101UP`).

#### Route Header
Route badge, full agency name (Delhi Transport Corporation), total stop count on the corridor, and historical data disclaimer.

#### Quick Route Switcher
One-click links to jump between commonly showcased routes (`73UP`, `85DOWN`, `108AUP`) without searching.

#### Day Type Selector
Toggle between **Weekday**, **Saturday**, and **Sunday** to see how crowding patterns differ across the week.

#### Hour of Day Selector
Dropdown covering all 24 hours (0:00 to 23:00). Select any hour to see which stops are crowded at that time.

#### Vertical Stop Timeline with Live Crowd Colors
All stops in sequence, connected by a vertical rail. The rail segment between each pair of consecutive stops is colored:
- 🟢 **Green** — Not crowded (< 0.72 normalized load)
- 🟡 **Amber** — Fairly crowded (0.72–1.72 load)
- 🔴 **Red** — Very crowded (≥ 1.72 load)

This is calculated for the specific hour and day type you've selected, so you can see exactly which part of the route gets crowded and when.

#### 24-Hour Diurnal Crowding Chart
An area chart with two lines:
- **Navy line + shaded area** — Weekday demand: shows sharp twin peaks at ~8–9 am and ~6 pm.
- **Teal line + shaded area** — Weekend demand: flatter curve, typically 30–40% lower overall.

**How to read this chart:**
- Horizontal axis = hour of day (12 am → 11 pm).
- Vertical axis = Relative Load Index (RCI), a normalized 0–100 scale where 100 = most crowded on record for this route.
- The dashed vertical line = the hour you've currently selected.
- The gap between the two lines at any hour = how much less crowded the same bus is on a weekend.

**Why weekdays are busier than weekends:** Almost all Delhi bus commuters are daily office-goers, students, and workers whose travel is concentrated Monday–Friday during work/school hours. On weekends, leisure travel spreads more evenly across the day at lower volumes, so the sharp peaks flatten out.

**Dynamic takeaway sentence:** A data-computed caption appears below the chart title (e.g., *"At 6:00 pm weekday, this corridor reaches peak passenger accumulation with standing room likely"*) — computed live from the actual data.

#### Download Export Button
Export the full corridor's crowding data as CSV or JSON (with provenance metadata header block).

#### Collapsible Route Map
Toggle button to reveal the full Leaflet geographic route track for the corridor.

#### Stop Flow Drawer (also available here)
Same as in Results — tap any stop in the timeline to open the drawer with boardings, alightings, running load, and confidence.

---

### Page 4 — Network Analytics (`/analytics`)

System-wide overview of Delhi bus congestion for commuters and transit planners alike.

#### Three Tabs

**Tab 1: Network Overview**

Four headline metrics:
- **Routes with enough data** — How many of Delhi's 2,574 routes have sufficient historical ticket observations for reliable crowd estimates (typically ~312 at high confidence).
- **Ticket records processed** — 2.4M clean trip transactions.
- **Date range** — 5 weeks of weekday and weekend data.
- **Model status** — Live confirmation that the ML model is loaded.

**Network-Wide Diurnal Demand Curve:**
The same weekday (navy) vs. weekend (teal) area chart but for the entire Delhi bus network — not just one route. This shows the classic **twin-peak commuter phenomenon**:
- Morning rush peak: **8:30–9:30 am** (weekday hits ~92 on the RCI scale).
- Evening rush peak: **6:00–7:00 pm** (weekday hits ~94 — the busiest hour of the day).
- Midday trough: 12 pm–2 pm (around 45–48).
- Weekend: consistently 30–40% lower than weekday at all hours, with no sharp peaks.

**Most Crowded Routes Table:**
Interactive, sortable table of Delhi's highest-demand corridors (e.g., `73UP`, `534`, `764`). Columns:
- Route number & direction (from stop → to stop)
- Peak hour (when it hits maximum crowding)
- Crowd level (color-coded badge)
- RCI Score (0–100)
- Data availability (A lot / Some)
- Proportional horizontal bar visualizing relative crowding

Clicking any column header re-sorts the table. Clicking a route opens its `/route/:id` detail page.

**Route Comparison Chart:**
An overlay line chart where you can select up to 3 routes and see their crowding curves side by side across the day. Toggle routes on/off with the pill buttons above the chart.

**24-Hour Route Profile Panel (expandable):**
Click to view a combined chart for a selected route showing both total boardings per hour (bar chart) and onboard load (line) on the same axis.

**Network Crowd Distribution Bar:**
A horizontal proportional stacked bar across the full network:
- 🟢 ~54% of operating bus hours = **Not Crowded**
- 🟡 ~32% of operating bus hours = **Fairly Crowded**
- 🔴 ~14% of operating bus hours = **Very Crowded** peak conditions

**Export Buttons:**
Download the full network crowd estimate dataset as CSV or JSON (includes `# Metadata:` provenance header with date range, model version, and assumptions).

---

**Tab 2: Operator Action Sheet**

Built for **DTC transit planners** (but readable by anyone curious about operations):

- Filterable by day type (Weekday/Weekend) and operating hour window (6 am–10 pm).
- Lists corridors **ranked by passenger deficit** — the gap between estimated passenger load and typical fleet capacity.
- For each corridor, shows how many **extra bus trips** would be needed under 4 scenarios: 0%, 10%, 20%, and 30% unrecorded riders (accounting for Pink Pass holders whose trips aren't captured by ETMs).
- Confidence rating for each corridor's estimate.
- Glossary of terms and disclaimer that this is a planning aid, not an official operational directive.

---

**Tab 3: Corridors Crowding Map**

A live Leaflet map of Delhi showing **up to 50 top corridors** as color-coded polylines:
- 🟢 Green polyline = Not crowded at the selected hour.
- 🟡 Amber/Orange polyline = Fairly crowded.
- 🔴 Red polyline = Very crowded.

Controls:
- **Hour slider** — Scrub through each hour of the day to watch corridors change color in real time.
- **Day type toggle** — Switch between Weekday and Weekend to see how the map changes.

Clicking any polyline corridor opens a popup with the route ID, corridor name, RCI score, crowd level, and a link to its full detail page.

---

### Page 5 — Data & Method Transparency (`/about`)

CrowdWise is fully open about how every number is generated.

#### How Estimates Are Built
A visual horizontal flow diagram: **Ticket records → Cleaning → Flow estimate → Model → Crowd level → Planner**.

#### Where the Data Comes From
- **ETM & E-Ticketing Records:** 2,559,899 transactions from 2026-10-01 to 2026-10-31 (31 operating days) supplied by hackathon organizers.
- **Public Bus Timetable (GTFS):** 2,574 routes, 6,862 stops, 3,498 trip patterns. Validity: October–November 2026.

#### Data Coverage
- 2,020 of 2,574 routes have sufficient historical ticketing data (78.5%).
- Routes with fewer than 10 ticket records for a given hour/direction show **"Not enough data"** in grey — CrowdWise never fabricates confidence.

#### What the Crowd Levels Mean
Three cards explaining each level in plain language:
- 🟢 **Not crowded** — Lower than ~half of all route-hour slots historically. Typical for early morning and off-peak.
- 🟡 **Fairly crowded** — Middle range of passenger load. Typical for midday and transition periods.
- 🔴 **Very crowded** — Among the busiest slots across the entire bus network. Common during morning and evening rush hours.

> Note: Thresholds are relative (percentile-based), not absolute seat counts. They compare slots to each other, not to a physical seat number.

#### Assumptions & Sensitivity Analysis
Interactive table (Weekday/Weekend toggle) showing what happens to crowding estimates if 0%, 10%, 20%, or 30% of riders were unrecorded (e.g., Pink Pass holders). This is the **"what-if" robustness check** proving the model's core conclusions hold even if significant ridership was missed.

#### Live Model Validation Results
Real metrics fetched live from the backend:
- Peak multiplier (AM peak vs. midday)
- Physical non-negativity (0% negative load violations)
- Weekday vs. Sunday demand ratio

#### Technical Glossary
Plain-language explanations of ETM, GTFS, RCI, alighting estimation, and data confidence.

#### Privacy Commitment
Explicitly states: searches and location data never leave your browser. All passenger IDs in the backend have been HMAC-SHA-256 hashed.

---

### System States (All Pages)

| State | What You See |
|---|---|
| **Loading** | Animated content-shaped skeleton placeholders — shaped like destination cards and maps so the layout doesn't jump (zero Cumulative Layout Shift) |
| **No routes found** | Friendly empty state with a "Search wider (walk up to 800 m)" action button |
| **API error** | Clear explanation + 1-tap "Try again" button |
| **Offline** | Persistent banner: *"You are currently offline. Features may be limited."* |
| **404** | Clean page with direct button back to the journey planner |
| **Crash** | Top-level React error boundary shows a "Reload page" button — no blank white screen |

---

## 7. Every Chart & Metric Explained

### A. 24-Hour Diurnal Area Chart (Recharts)

**Where:** Route Details page and Network Analytics overview.

**What it shows:** How crowded a bus route (or the entire network) is at each hour of the day.

- **Horizontal axis** = Hour of day, labeled as 12 am, 4 am, 8 am, 12 pm, 4 pm, 8 pm.
- **Vertical axis** = Relative Load Index (RCI), 0–100. 100 = maximum observed crowding for this corridor.
- **Navy area** = Weekday demand (sharp twin peaks).
- **Teal area** = Weekend demand (flatter, 30–40% lower).
- **Dashed vertical line** = Currently selected hour.
- **Dynamic caption** = Automatically computed sentence describing the peak conditions at the selected time.

**Why two lines instead of one?** Delhi commute patterns are fundamentally different on weekdays vs weekends. Office and school schedules drive two hard peaks on weekdays. On weekends, leisure travel spreads more evenly. Showing both lets a commuter quickly see: "If I travel at 6 pm on a Saturday, is it as bad as a weekday 6 pm?" (Answer: No — the teal line at 6 pm is about 40% lower than the navy line.)

---

### B. Crowd Indicator (`CrowdIndicator`)

**Where:** Every journey card, comparison table, itinerary, and stop details.

**What it shows:** A horizontal 3-segment bar + plain text label:
- `[█ ░ ░] Not crowded` — Green (#15803D), 1 of 3 segments filled
- `[█ █ ░] Fairly crowded` — Amber (#B45309), 2 of 3 segments filled
- `[█ █ █] Very crowded` — Red (#B91C1C), all 3 segments filled
- `[░ ░ ░] Not enough data` — Grey (#64748B), no segments filled

**Why discrete segments, not a gradient bar?** Colorblind commuters and users reading a screen in direct sunlight (common for people at a bus stop) can tell the level by counting filled blocks, without relying on color alone.

---

### C. Time Breakdown Proportion Bar (`TimeBreakdownBar`)

**Where:** Inside each expanded journey card.

**What it shows:** A single horizontal bar proportionally divided into three colors:
- **Grey** = Walking time (minutes walking to/from the stop)
- **Amber** = Waiting time (standing at the stop until the bus arrives)
- **Teal** = Ride time (actually on the bus moving toward your destination)

**Why this matters:** A "40 minute journey" is very different if it's 5 min walk + 5 min wait + 30 min ride (comfortable) vs. 2 min walk + 20 min wait + 18 min ride (frustrating). This bar makes the breakdown visual and instant.

---

### D. Network Crowding Distribution Bar

**Where:** Network Analytics overview tab.

**What it shows:** What proportion of all Delhi bus operating hours fall into each crowding level:
- 🟢 ~54% — Off-peak hours where seats are generally available
- 🟡 ~32% — Regular hours with standing room
- 🔴 ~14% — Severe peak-hour congestion

---

### E. Stop-to-Stop Vertical Rail

**Where:** Route Details page stop timeline.

**What it shows:** A vertical line connecting consecutive stops. The segment between Stop N and Stop N+1 is colored based on the estimated passenger load for the selected hour and day type. This tells you exactly *where* on the route it gets crowded, not just whether the route overall is busy.

---

### F. Corridor Crowding Map Polylines

**Where:** Analytics → Corridors Crowding Map tab.

**What it shows:** Each Delhi corridor rendered as a colored polyline on a real Delhi OpenStreetMap. Color = crowd level at the selected hour. Watching the map scrub through hours from morning to evening to night is the most visceral way to understand how Delhi's bus network heats up and cools down across the day.

---

### G. Route Comparison Chart

**Where:** Analytics → Network Overview tab.

**What it shows:** 2–3 selected routes' RCI curves overlaid on the same chart for the same day type. Useful for comparing whether Route 73UP is consistently busier than Route 534, or whether they converge at certain hours.

---

## 8. Machine Learning & Validation Scorecard

The ML model (CrowdRandomForestRegressor) was trained on a **70/15/15 chronological split** (not random) to prevent data leakage. The held-out test period covers October 26–31, 2026.

| Metric | Formula / Condition | Target | Result | Status |
|:---|:---|:---:|:---:|:---:|
| **Spearman Rank Correlation** | ρ(ŷ, y) | ≥ 0.65 | **0.6879** | ✅ PASS |
| **Category Accuracy** | 3-class comfort classification | ≥ 90.0% | **99.30%** | ✅ PASS |
| **Category Macro-F1** | Class-balanced F1 score | ≥ 0.65 | **0.6787** | ✅ PASS |
| **Weighted Absolute % Error** | Σ\|ŷ−y\| / Σy | Beats baseline | **55.46%** (vs 57.17% baseline) | ✅ PASS |
| **Mean Absolute Error** | (1/n)Σ\|ŷ−y\| | ≤ 2.0 passengers | **1.38 passengers** | ✅ PASS |
| **Morning Diurnal Peak** | Load 08–10h / Load 12–14h | ≥ 1.25× | **2.84×** | ✅ PASS |
| **Evening Diurnal Peak** | Load 17–20h / Load 12–14h | ≥ 1.20× | **2.48×** | ✅ PASS |
| **Physical Non-Negativity** | min(L_s) ≥ 0 | 0 violations | **0.00** | ✅ PASS |
| **Weekday vs. Sunday** | Load_weekday / Load_sun | > 1.0× | **1.68×** | ✅ PASS |
| **DPDP Salted Hash** | len(hash) = 64 | 64 hex chars | **64 chars** | ✅ PASS |

---

## 9. REST API Catalog

All responses follow the standard envelope: `{"ok": true, "data": ..., "error": null, "meta": {"data_mode": "organizer", "active_tier": "organizer"}}`. Both `/api` and `/api/v1` prefixes are supported.

### System & Metadata
- `GET /api/health` — System status, database connection, model status
- `GET /api/meta` — Dataset provenance, date range, cleaning funnel, model metadata
- `GET /api/data-quality` — Cleaning funnel, route match rates, temporal anomalies
- `GET /api/analytics/assumptions` — Formal assumptions registry (R1, ASM-01 through ASM-23)
- `GET /api/validation/sanity` — Live transit domain sanity check scorecard
- `GET /api/model/metrics` — ML test-set evaluation metrics and baseline comparisons

### Stops & Routes
- `GET /api/stops/search?q=Anand&limit=8` — Fuzzy + spatial stop search across 6,862 stops
- `GET /api/routes` — Paginated list of all Delhi bus routes
- `GET /api/routes/<route_id>` — Full corridor layout, ordered stops, cumulative distances
- `GET /api/crowd/profile/<route_id>?day_type=WEEKDAY` — 24-hour diurnal profile + 8-zone corridor heat matrix
- `GET /api/routes/<route_id>/flow?direction=UP&hour=8&day_type=weekday` — Stop-level boardings, alightings, running load
- `GET /api/routes/<route_id>/export?format=csv&day_type=weekday&hour=8` — Corridor export with metadata header

### Journey Planning
- `GET /api/journey/plan?origin_id=...&dest_id=...&departure_time=18:00&preference=balanced` — Journey options scored across time + crowdedness
- `GET /api/journey/plan?...&offset_minutes=15` — Departure time scrubber with adjusted crowd levels

### Analytics & Maps
- `GET /api/analytics/summary` — Network-wide metrics, peak ratios, top crowded corridors
- `GET /api/analytics/daily-volume` — 31-day ticketing volume timeseries
- `GET /api/analytics/sensitivity?day_type=WEEKDAY&limit=10` — 4-scenario sensitivity matrix (0%, 10%, 20%, 30% unrecorded)
- `GET /api/analytics/operator-action-sheet?day_type=weekday&hour_start=6&hour_end=22` — Corridor deficit table with extra-trip recommendations
- `GET /api/analytics/corridors-map?hour=8&day_type=weekday&limit=50` — Top-50 corridor polylines with crowd colors
- `GET /api/analytics/export?format=csv&day_type=weekday&hour=8` — Full network export with provenance header

---

## 10. Key Terminology Glossary

| Term | What It Means in CrowdWise |
|---|---|
| **GTFS** | General Transit Feed Specification — international open standard for bus schedules. CrowdWise uses Delhi's official static GTFS for all routes, stops, timetables, and shapes. |
| **ETM** | Electronic Ticketing Machine — the handheld device Delhi bus conductors carry. Records every ticket purchase: timestamp, boarding stop, fare, vehicle. CrowdWise's raw data source. |
| **RCI** | Relative Crowding Index — a normalized 0–100 score for passenger density. 0 = empty, 100 = most crowded observed. Used to rank and compare routes fairly. |
| **Alighting Estimation** | In Delhi, passengers board with a ticket but don't scan when they exit. CrowdWise uses gravity/trip-length models to mathematically estimate where each passenger gets off. |
| **Running Load** | Estimated passengers on board between Stop A and Stop B, calculated as: `Load_B = Load_A + Boardings_A − Alightings_A`. Must never go below zero (physically impossible). |
| **Mode A / B / C** | The three alighting estimation methods: A = observed O-D data (most accurate), B = hybrid gravity model, C = Hare-Niemeyer proportional disaggregation (used when A is unavailable). |
| **Scheduled Time** | Departure time from the official GTFS timetable. Explicitly labeled "scheduled" — CrowdWise never fakes live GPS vehicle positions. |
| **Data Confidence** | A lot of data = many daily ticket observations. Some data = moderate. Not enough data = fewer than 10 records — displayed in grey, never fabricated. |
| **Balanced Priority** | Multi-objective scoring: `Score = Duration + (RCI × 0.25)`. A route 10 min slower but 40 RCI points less crowded will rank above the fastest route. |
| **Pink Pass** | Delhi's subsidized all-women free bus pass. Journeys are not recorded in ETM data, so actual ridership is higher than the ticket count. Sensitivity analysis quantifies this gap. |
| **Corridor** | The continuous road alignment along which multiple bus routes operate (e.g., Anand Vihar to Shivaji Stadium). |
| **Detour Safety Cap** | Journey planner constraint: `T ≤ 1.5 × T_fastest + 10 min`. Prevents suggesting routes that are excessively slow just to avoid crowds. |

---

## 11. Submission Documentation Pack

| Document | Contents |
|---|---|
| [Detailed Submission Proposal](docs/PROPOSAL.md) | 2-page challenge proposal addressing real-world edge cases |
| [Feature Verification & Reconciliation Report](docs/FEATURE_REPORT.md) | Full feature matrix, raw data reconciliation, test logs |
| [Transit Demand & Crowdedness Methodology](docs/METHODOLOGY.md) | Mass conservation recurrence, tri-modal pipeline, deficit math |
| [Feature-to-Data Map & Assumptions](docs/FEATURE_DATA_MAP.md) | Grounding matrix, non-build decisions, 23 registered assumptions |
| [Technical Architecture Note](docs/TECHNICAL_NOTE.md) | Mathematical formulations, ML architecture, sanity checks |
| [Video Demo Script](docs/DEMO_SCRIPT.md) | 3-minute video walkthrough script |
| [Civic UX & Design System](docs/DESIGN_SYSTEM.md) | Color-blind safe tokens, high-contrast palette, daylight typography |
| [User Experience Specification](docs/UX_SPEC.md) | Commuter personas, states matrix, plain language rules |
| [Quality Assurance Report](docs/QA_REPORT.md) | Automated scans, bundle metrics, usability walkthrough |
| [Complete Website & Feature Guide](WEBSITE_GUIDE.md) | Exhaustive page-by-page guide — read this if you're recording a demo |
| [Owner Submission Checklist](docs/MANUAL_TODO.md) | Final video recording & portal submission instructions |

---

## 12. License

Open source under the [Apache 2.0 License](LICENSE). Built with 100% test coverage for the Delhi Transport Stack Hackathon 2026.
