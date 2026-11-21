# CrowdWise — Complete Website & Feature Guide

> **Official Comprehensive Guide to the CrowdWise Delhi Bus Journey Planner**  
> *Everything you need to know about every page, feature, chart, metric, and term — written so you can explain it without being a data scientist.*

---

## Table of Contents

1. [What is CrowdWise?](#1-what-is-crowdwise)
2. [Data Honesty & Core Philosophy](#2-data-honesty--core-philosophy)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Page 1 — Journey Planner (`/`)](#4-page-1--journey-planner-)
5. [Page 2 — Journey Results (`/results`)](#5-page-2--journey-results-results)
   - [5.1 Route Cards (TransitRow)](#51-route-cards-transitrow)
   - [5.2 Departure Time Scrubber](#52-departure-time-scrubber)
   - [5.3 Compare Top 3 (CompareTable)](#53-compare-top-3-comparetable)
   - [5.4 Interactive Route Map](#54-interactive-route-map)
   - [5.5 Stop-by-Stop Itinerary Timeline](#55-stop-by-stop-itinerary-timeline)
   - [5.6 Stop Flow Drawer](#56-stop-flow-drawer)
   - [5.7 24-Hour Route Profile Chart (on Results page)](#57-24-hour-route-profile-chart-on-results-page)
6. [Page 3 — Route Details & 24-Hour Profile (`/route/:id`)](#6-page-3--route-details--24-hour-profile-routeid)
   - [6.1 Vertical Stop Timeline with Crowd Colors](#61-vertical-stop-timeline-with-crowd-colors)
   - [6.2 The 24-Hour Diurnal Crowding Chart](#62-the-24-hour-diurnal-crowding-chart)
7. [Page 4 — Network Analytics (`/analytics`)](#7-page-4--network-analytics-analytics)
   - [7.1 Tab: Network Overview](#71-tab-network-overview)
   - [7.2 Tab: Operator Action Sheet](#72-tab-operator-action-sheet)
   - [7.3 Tab: Corridors Crowding Map](#73-tab-corridors-crowding-map)
8. [Page 5 — Data & Method Transparency (`/about`)](#8-page-5--data--method-transparency-about)
9. [System States (Loading, Error, Offline, 404)](#9-system-states-loading-error-offline-404)
10. [Every Chart & Visual Representation Explained](#10-every-chart--visual-representation-explained)
11. [Complete Glossary of Terms](#11-complete-glossary-of-terms)
12. [Accessibility & Design System](#12-accessibility--design-system)
13. [Local Server Instructions & Key Showcase URLs](#13-local-server-instructions--key-showcase-urls)

---

## 1. What is CrowdWise?

**CrowdWise** is a crowdedness-aware public bus journey planner built for commuters across Delhi's National Capital Territory.

While conventional transit apps only tell you *when* a bus might arrive or how long a trip takes, **CrowdWise tells you how crowded that bus will likely be** — allowing commuters to make an informed trade-off between travel time and comfort.

### The Problem It Solves

- Delhi buses can be severely congested during morning and evening peak hours.
- A parallel route, or the same bus leaving 15 minutes later, may have plenty of space.
- Commuters — especially elderly, pregnant, or daily workers — often prefer a bus 10 minutes slower if it means avoiding an overwhelming crowd.
- Delhi's buses don't have passenger occupancy sensors. Instead, they use **Electronic Ticketing Machines (ETMs)** that record every ticket purchase when someone boards, but nothing when someone exits.
- CrowdWise bridges this gap by using **2.56 million official ETM transactions from October 2026** combined with the official **Delhi Static GTFS schedule** to reconstruct historical passenger demand stop-by-stop, and then predicts future crowding with a machine learning model.

---

## 2. Data Honesty & Core Philosophy

CrowdWise adheres to strict principles about how it communicates estimates:

1. **Not a live GPS tracker.** CrowdWise displays scheduled GTFS timetable departures. It never fakes live vehicle positions or artificial "arriving in 3 min" countdowns.
2. **Demand estimates, not seat counts.** ETMs record when someone boards; they don't count physical seats. CrowdWise uses demand-based language: "Not crowded", "Fairly crowded", "Very crowded".
3. **"Not enough data" is a valid answer.** When fewer than 10 ticket records exist for a route/hour slot, the app displays a grey indicator and the phrase "Not enough data". It never fabricates confidence.
4. **Mandatory transparency line.** Every planning screen shows: *"Based on past ticket data for this time of day."*
5. **Zero synthetic hallucinations.** Every number, percentage, and travel time comes directly from the database and ML models trained on actual hackathon datasets.

---

## 3. System Architecture & Data Flow

```
┌────────────────────────────────────┐  ┌──────────────────────────────────┐
│   Delhi Static GTFS                │  │   October 2026 ETM Ticket Data   │
│  (6,862 stops, 2,574 routes,       │  │  (2.56M transactions,            │
│   Stop Times, Shapes, Trips)       │  │   conductor fare recordings)     │
└───────────────┬────────────────────┘  └──────────────┬───────────────────┘
                │                                       │
                ▼                                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       Data Processing Pipeline                           │
│  • Normalizes stop names, maps colloquial aliases                        │
│  • Reconstructs alightings via Mode A/B/C alighting models               │
│  • Computes stop-to-stop running load (3.32M SegmentCrowdFacts rows)     │
│  • DPDP-compliant passenger ID hashing (HMAC-SHA-256)                    │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│          SQLite Central Transit Database (crowdwise.db)                   │
│    DimStops, DimRoutes, DimTrips, StopTimes, SegmentCrowdFacts            │
└───────────────────┬──────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐   ┌────────────────────────────────────┐
│  Flask REST API  │   │  CrowdRandomForestRegressor (ML)   │
│  (Port 5000)     │◄──│  Trained on 70% chronological data │
│                  │   │  RCI calibration (0–100 scale)     │
└────────┬─────────┘   └────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Vite + React Frontend (Port 3000)                      │
│  • 5 Pages: Planner, Results, Route Details, Analytics, About            │
│  • Leaflet OpenStreetMap interactive maps                                 │
│  • Recharts diurnal analytics & crowding visualizations                   │
│  • English + हिन्दी bilingual (1-click language toggle)                   │
│  • WCAG 2.2 AA accessible, colorblind-safe design system                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Page 1 — Journey Planner (`/`)

The homepage is a **pure utility tool** — it opens straight to the journey planner with zero marketing banners or decorative fluff.

### Stop Search Boxes (`StopCombobox`)

**"From" stop (Origin):**
- Typeahead search across all **6,862 Delhi bus stops**, returning results instantly as you type.
- Recognizes **colloquial shorthand**: typing `CP` finds *Connaught Place / Shivaji Stadium Terminal*; `ISBT` finds both *Anand Vihar ISBT* and *Kashmere Gate*; `AIIMS` finds *AIIMS New Delhi*; `NDLS` finds *New Delhi Railway Station*.
- When focused with an **empty input**, instantly opens a **"Suggested Major Transit Hubs"** list — Delhi's 8 highest-volume interchanges for quick one-tap selection without typing.

**"To" stop (Destination):**
- Identical search functionality as the origin box.

### Swap Button (⇅)
- Single tap to instantly interchange origin and destination.
- 44px minimum touch target — usable while standing on a moving bus.

### Departure Time
- Toggle between **"Leave now"** (uses your current device clock, updated every 30 seconds) and **"Leave at"** with a time picker.
- The demo defaults to 6:00 PM to showcase the peak hour.

### Journey Priority (Segmented Control)

Three modes that determine how routes are ranked:

| Priority | How It Ranks | Best For |
|---|---|---|
| **Fastest** | Minimum total travel time only. No crowding penalty whatsoever. | When you absolutely must arrive as fast as possible |
| **Balanced (default)** | `Score = Duration + (RCI × 0.25)`. A 10-min slower bus with 40 lower RCI ranks above the fastest bus. | Most commuters — saves real comfort for minimal time cost |
| **Least Crowded** | Minimizes RCI score, regardless of time cost. | Elderly, pregnant, passengers with luggage, or long commutes |

Your preference is **saved across sessions** in `localStorage` — when you re-open the app, it remembers your last choice.

### Quick Showcase Button
One-click button: **"Try corridor: Anand Vihar → Connaught Place (6:00 pm)"** — pre-fills both stops and executes the primary demonstration route immediately.

### Recent Searches Drawer
- Automatically stores your last **5 searches** in `localStorage`.
- Tap any previous search to re-run it in one second.
- **"Clear recent"** wipes local search history. Data never leaves your device.

### Form Error Handling
If you try to search without selecting both stops, the form shows a clear inline error message: *"Please select both an origin and a destination stop."*

---

## 5. Page 2 — Journey Results (`/results`)

Displays all ranked journey options for your search, with a full interactive map, itinerary timeline, and departure scrubber.

### Page Header
- Shows `Origin → Destination` with departure time.
- **Data honesty disclaimer:** *"Leaves about 6:00 pm · Based on past ticket data for this time of day."*
- **Back button** to return to the planner.
- **Sorting controls** (Fastest / Balanced / Least Crowded) — instantly re-rank options.

---

### 5.1 Route Cards (`TransitRow`)

Each journey option is displayed as a card. What you see on each card:

| Element | What It Shows | Example |
|---|---|---|
| **Route Badge** | Bold high-contrast navy badge | `73UP`, `85DOWN`, `943UP`, `108AUP` |
| **Departure time** | When the bus leaves, in 12-hour format | `Leaves 6:00 pm · scheduled` |
| **Total duration** | Largest, most prominent number on the card | `40 min` |
| **Distance & stops** | Corridor km + number of stops | `13.4 km · 25 stops` |
| **Speed** | Estimated corridor operating speed | `~21 km/h` |
| **Crowding at stop** | What to expect when you arrive at the stop | `At stop: Not crowded` |
| **Busiest stretch** | Worst crowding during the ride | `Busiest: Very crowded` |
| **"Why?" popover** | Expandable scoring breakdown | "Fastest option · RCI 88" |
| **Recommendation pill** | Why CrowdWise highlighted this option | "Recommended for Balanced" |

**Expanding a card:**
Tapping a route card expands an inline drawer showing:
- **Time Breakdown Bar** — proportion of walk time, wait time, and ride time (see Section 10C).
- **Data Confidence** — A lot of data / Some data / Not enough data.
- **Link** to the route's full 24-hour profile page.

---

### 5.2 Departure Time Scrubber

Five buttons displayed horizontally:

| Button | What It Does |
|---|---|
| **Depart now / +0m** | Shows journeys departing at your original search time (e.g., 6:00 pm) |
| **+15m** | Re-fetches journey options for 15 minutes later (e.g., 6:15 pm) |
| **+30m** | Re-fetches for 30 minutes later (e.g., 6:30 pm) |
| **+45m** | Re-fetches for 45 minutes later (e.g., 6:45 pm) |
| **+60m** | Re-fetches for 60 minutes later (e.g., 7:00 pm) |

Under each button is the **actual time** that offset represents (e.g., `6:15 pm`). Clicking any button instantly re-fetches from the API and updates all crowding indicators.

**Why this feature exists:** Peak congestion on most Delhi corridors eases significantly after 6:30 PM. A commuter who can leave 15–30 minutes later often drops from "Very crowded" to "Fairly crowded" or "Not crowded" — a full comfort tier improvement with minimal schedule disruption.

**Departure Tips callout:** When the API returns specific tips (e.g., "The 6:15 pm departure is significantly less crowded than the 6:00 pm on this corridor"), they appear as a teal callout beneath the scrubber buttons with a lightbulb icon.

---

### 5.3 Compare Top 3 (`CompareTable`)

Tapping the **"Compare top 3"** button reveals a full-width side-by-side matrix:

**Attributes compared:**
- Total Travel Time (minutes)
- Walking Time
- Waiting Time
- Ride Time (in-vehicle)
- Crowding at Boarding Stop
- Busiest Stretch of the Ride
- Data Confidence Level
- Number of Transfers

**Automatic badges:**
- 🟦 **"Fastest"** — dark navy badge on the minimum-duration option.
- 🟢 **"Least crowded"** — teal badge on the lowest-RCI option.

**Selection:** Tapping any column in the table immediately selects that route, highlights its path on the map, and scrolls the itinerary to show that journey.

---

### 5.4 Interactive Route Map (`LeafletRouteMap`)

Built with Leaflet.js on OpenStreetMap:

- **Dual-cased polyline:** A 6px deep navy casing line overlaid with a 3.5px pine teal core line. The double-width casing ensures the route is visible over Delhi's dense street grid even on small mobile screens.
- **Custom stop markers:**
  - Boarding stop → Large 7px teal circle with navy border
  - Alighting stop → Large 7px navy circle with white border
  - Intermediate stops → Small 4px white circle with navy outline
  - **No default blue Leaflet pins** — eliminated to prevent Vite asset-bundling errors.
- **Interactive popups:** Tap any stop marker to see stop name, stop ID, sequence number, cumulative distance from origin, and scheduled arrival time.
- **Auto-fit bounds:** Automatically pans and zooms to frame the entire corridor whenever you switch between journey options.
- **"Approximate path" notice:** If GTFS shape geometry is unavailable for a secondary feeder route, an amber badge appears in the map legend: *"Approximate path between stops"* — the app never silently misleads.

---

### 5.5 Stop-by-Stop Itinerary Timeline (`JourneyItinerary`)

A Moovit-style vertical timeline showing every stop on the selected journey:

**Header strip:** Route badge, departure–arrival time span (e.g., `6:00 pm – 6:40 pm`), total minutes, operator (DTC), corridor distance, and overall route crowd level.

**Boarding stop:** Teal circular indicator, stop name, scheduled departure time, Stop ID.

**Intermediate stops (collapsible):**
- Shows count (e.g., *"23 intermediate stops"*).
- Tap to expand/collapse. When expanded, every stop shows:
  - Sequence number (`#2`, `#3`…)
  - Stop name
  - Cumulative distance from boarding stop (e.g., `+1.8 km`)
  - Estimated arrival time (e.g., `6:04 pm`)

**Alighting stop:** Dark navy square indicator, final arrival time, total distance.

**Speed & fare advisory:** At the bottom of the itinerary — estimated corridor operating speed (e.g., `~18 km/h`) and pass validity (e.g., `DTC Daily / Pink Pass valid`).

---

### 5.6 Stop Flow Drawer (`StopFlowDrawer`)

Tap any stop in the itinerary (or any stop marker on the map) to open a bottom-sliding panel:

**What it shows:**
- Stop name and sequence number
- Hour and day type being inspected
- **Boardings** at this stop — estimated passengers getting on the bus here
- **Alightings** at this stop — estimated passengers getting off (inferred, since ETMs don't record exits)
- **Running passenger load** — how many people are on the bus *after* this stop
- **Data attribution mode** — Mode A (observed origin-destination pairs) or Mode B (inferred alightings via gravity model)
- **Confidence rating** — high / medium / low
- **Sample ticket count** — how many ticket records underlie this estimate

Close with the ✕ button or press Escape.

---

### 5.7 24-Hour Route Profile Chart (on Results page)

After route options load, a collapsed route profile chart also appears below the itinerary for the currently selected route. This is the same weekday-vs-weekend dual-curve area chart from the Route Details page — letting you understand the full-day pattern of your selected bus without navigating away from results.

---

## 6. Page 3 — Route Details & 24-Hour Profile (`/route/:id`)

Dedicated deep-dive page for any Delhi bus route (e.g., `/route/73UP`, `/route/101UP`, `/route/85DOWN`).

**Route header:** Route badge, full agency name (Delhi Transport Corporation), total stop count, historical disclaimer.

**Quick Route Switcher:** Chip buttons for commonly showcased routes — click to jump without searching.

**Day Type Selector:** Toggle between **Weekday / Saturday / Sunday** — crowding patterns differ significantly across these.

**Hour of Day Selector:** Dropdown covering all 24 hours (0:00–23:00). Changing the hour updates both the vertical stop timeline colors and the dashed reference line on the chart.

---

### 6.1 Vertical Stop Timeline with Crowd Colors

All stops in sequence, connected by a vertical colored rail. The segment of rail between Stop N and Stop N+1 is colored based on the estimated passenger load at the **currently selected hour and day type**:

| Color | Meaning | Load Threshold |
|---|---|---|
| 🟢 Green | Not crowded | < 0.72 normalized load |
| 🟡 Amber | Fairly crowded | 0.72–1.72 normalized load |
| 🔴 Red | Very crowded | ≥ 1.72 normalized load |

**What this tells you:** Not all segments of a route are equally crowded at the same time. You might see a route that's red between stops 5–12 (the central city stretch) but green before and after. This tells a commuter: "If I board after stop 12, I'll get a much emptier bus."

**Tap any stop** in the timeline to open the Stop Flow Drawer for that stop.

**Download export:** A download button exports the full corridor data for the selected hour and day type as CSV or JSON (with provenance metadata header).

**Toggle map:** A button reveals the full Leaflet geographic route track for the corridor.

---

### 6.2 The 24-Hour Diurnal Crowding Chart

The most important chart on the site. **Read this carefully if you're demoing.**

**Type:** Recharts AreaChart with two overlaid filled areas.

**What it shows:** How crowded a specific route (or the network) is at each hour across a full day.

**Axes:**
- **Horizontal (X axis):** Hour of day — labeled as `12 am`, `4 am`, `8 am`, `12 pm`, `4 pm`, `8 pm`.
- **Vertical (Y axis):** Relative Load Index (RCI), 0–100. A score of 100 means the most crowded this route has ever been recorded.

**Two lines:**
- **Navy area** = Weekday demand. Shows the characteristic **twin-peak shape**: sharp rise at ~7–8 AM (morning rush), drop toward midday, rise again at ~5–6 PM (evening rush), then fall to near zero by midnight.
- **Teal area** = Weekend demand. Flatter curve, 30–40% lower overall, no sharp peaks. Rises more gradually and spreads across a wider mid-morning window.

**Dashed vertical line:** The hour you currently have selected — connects the chart to the stop timeline below.

**Dynamic takeaway caption:** A data-computed sentence below the chart title describes peak conditions in plain English. Example: *"At 6:00 pm (weekday), this corridor reaches peak passenger accumulation with standing room likely."* This is calculated from actual data values, not a template.

#### Why weekdays are busier than weekends (the full explanation)

The twin-peak pattern on weekdays is driven by **fixed-schedule commuters** — office workers, school students, domestic workers, government employees — whose travel is concentrated in two hard windows: morning arrival (7–10 AM) and evening departure (5–8 PM). Between these windows, demand drops sharply because these commuters are at their destinations.

On weekends, this population is at leisure. Travel spreads more evenly across the day — shopping, visiting family, recreation — at lower overall volumes. There are no hard institutional schedule drivers creating sharp peaks.

**The empirical evidence:** Weekday average load is **1.68× higher** than Sunday load across the entire Delhi network. The morning peak is **2.84× busier** than midday. The evening peak is **2.48× busier** than midday. These are not assumptions — they are measured from the October 2026 ticket data and validated by the sanity check scorecard.

---

## 7. Page 4 — Network Analytics (`/analytics`)

System-wide overview for commuters and transit planners. Three tabs.

---

### 7.1 Tab: Network Overview

**Four headline metric cards:**

| Card | Meaning |
|---|---|
| **Routes with enough data** | Of Delhi's 2,574 routes, how many have enough historical ticket observations for reliable estimates (~312 at high confidence) |
| **Ticket records processed** | 2.4M clean trip transactions after data cleaning |
| **Date range** | 5 weeks of weekday and weekend data (October 2026) |
| **Model status** | Live confirmation the ML model is loaded and active |

**Network-Wide Diurnal Demand Curve:**
The same weekday (navy) vs. weekend (teal) area chart for the entire Delhi bus network. Key numbers:
- **Morning rush peak** = ~8–9 AM weekday → RCI ~92
- **Evening rush peak** = ~6 PM weekday → RCI ~94 (the busiest hour of the day for all of Delhi)
- **Midday trough** = 12–2 PM → RCI ~45–48
- **Weekend 6 PM** = RCI ~58 (vs 94 on weekdays — 38% lower)

**Most Crowded Routes Table:**
Sortable table of Delhi's highest-demand corridors:
- Columns: Route, Direction, Peak Hour, Crowd Level (color-coded badge), RCI Score, Data Availability
- Proportional horizontal bar visualizes RCI relative to the maximum
- Click any column header to re-sort ascending/descending
- Click any route name → navigates to that route's `/route/:id` detail page

**Route Comparison Line Chart:**
Toggle 2–3 routes using pill buttons above the chart to overlay their crowding curves on the same chart for the same day type. Useful for seeing: "Is 73UP always busier than 534, or do they converge at certain hours?"

**24-Hour Route Profile Panel (expandable):**
Click to reveal a secondary chart for a selected route showing both total boardings per hour (bar) and onboard load (line) on the same axis — a more granular view than the summary diurnal curve.

**Network Crowd Distribution Bar:**
Horizontal proportional stacked bar:
- 🟢 **~54%** of operating bus hours → Not crowded (seats generally available)
- 🟡 **~32%** of operating bus hours → Fairly crowded (standing room)
- 🔴 **~14%** of operating bus hours → Very crowded peak conditions

**Export Buttons (top-right):**
- **Export CSV** → Downloads `network_crowd_estimates.csv` with a `# Metadata:` provenance header block including date range, model version, and assumptions.
- **Export JSON** → Same data in JSON format.

---

### 7.2 Tab: Operator Action Sheet

For DTC transit planners (and curious commuters):

**What it shows:** Corridors ranked by **passenger deficit** — the gap between estimated passenger load and what the typical bus fleet can carry.

**Filters:**
- **Day type:** Weekday or Weekend
- **Hour window:** Adjustable start and end hour (default: 6 AM–10 PM)
- **Minimum confidence:** Filter to only high-confidence estimates

**What each row shows:**
- Corridor route and direction
- Estimated average load
- How many **extra bus trips** would be needed under 4 scenarios: 0%, 10%, 20%, 30% unrecorded riders

**Why 4 scenarios?** Delhi's **Pink Pass** (subsidized all-women free bus pass) doesn't generate an ETM ticket. Those journeys are real but invisible in the data. This sensitivity table shows planners: "Even if 20% of our riders are unrecorded, here are still the top corridors that need extra buses."

**Glossary** and **disclaimer** at the bottom confirm this is a planning aid, not an operational directive.

---

### 7.3 Tab: Corridors Crowding Map

A live Leaflet map of Delhi showing up to **50 top corridors** as color-coded polylines.

| Polyline Color | Meaning |
|---|---|
| 🟢 Green | Not crowded at the selected hour |
| 🟡 Amber/Orange | Fairly crowded |
| 🔴 Red | Very crowded |

**Controls:**
- **Hour selector** — Scrub through hours of the day; the map re-fetches and recolors all polylines.
- **Day type toggle** — Switch between Weekday and Weekend; the whole map changes.

**Interactions:**
- Click any polyline → popup with route ID, corridor name, RCI score, crowd level, and a link to the route's full detail page.
- The map auto-fits all polylines into view.

---

## 8. Page 5 — Data & Method Transparency (`/about`)

CrowdWise is completely open about how every number is generated.

### How Estimates Are Built (flow diagram)
Horizontal visual: **Ticket records → Cleaning → Flow estimate → Model → Crowd level → Planner**

### Where the Data Comes From
Two cards:
- **ETM & E-Ticketing Records:** 2,559,899 transactions from 2026-10-01 to 2026-10-31 (31 operating days).
- **Public Bus Timetable (GTFS):** 2,574 routes, 6,862 stops, 3,498 trip patterns, October–November 2026 validity.

### Data Coverage
- **2,020 of 2,574 routes** have sufficient historical ticketing data (78.5%).
- Routes with < 10 records for a given hour/direction show "Not enough data" in grey — never fabricated.

### What the Crowd Levels Mean (3 cards)
- 🟢 **Not crowded** — below the ~50th percentile of historical load. Early morning / late evening.
- 🟡 **Fairly crowded** — middle range. Midday and transition hours.
- 🔴 **Very crowded** — top tier. Morning and evening rush.
- Thresholds: < 0.72 load = not crowded; 0.72–1.72 = fairly; ≥ 1.72 = very crowded.

> **Important:** These are relative comparisons between route-hour slots, not counts of seats or people.

### Assumptions & Sensitivity Analysis (interactive)
Toggle Weekday/Weekend. Table shows what happens if 0%, 10%, 20%, or 30% of riders were unrecorded. Core conclusions remain stable even under pessimistic scenarios.

### Live Model Validation Results
Real metrics fetched live from `/api/validation/sanity`:
- Peak multiplier (AM vs. midday)
- Physical non-negativity (0% negative load violations)
- Weekday vs. Sunday demand ratio

### Technical Glossary
Plain-language definitions of ETM, GTFS, RCI, alighting estimation, running load, data confidence.

### Privacy Commitment
All passenger IDs hashed with HMAC-SHA-256. User searches never leave the browser. No tracking or analytics.

---

## 9. System States (Loading, Error, Offline, 404)

| State | Trigger | What You See |
|---|---|---|
| **Loading (skeleton)** | API request in progress | Animated content-shaped skeleton placeholders — shaped like destination cards and maps so the layout doesn't jump (zero Cumulative Layout Shift) |
| **No routes found** | No direct bus between two stops | Friendly empty state + "Search wider (walk up to 800 m)" action button |
| **API error** | Backend or network failure | Clear explanation + 1-tap "Try again" button |
| **Offline** | `navigator.onLine` = false | Persistent banner: *"You are currently offline. Features may be limited."* |
| **404** | Invalid URL | Clean page with "Back to journey planner" button |
| **Runtime crash** | Unexpected JS exception | React error boundary → graceful "Reload page" screen, never a blank white screen |

---

## 10. Every Chart & Visual Representation Explained

### A. 24-Hour Diurnal Area Chart (Recharts AreaChart)

**Found on:** Route Details page, Network Analytics overview, Results page (collapsed panel)

**What you see:**
- **Navy filled area** = Weekday demand
- **Teal filled area** = Weekend demand
- **Dashed vertical line** = Currently selected hour
- **X axis** = Hour of day (12 am, 4 am, 8 am, 12 pm, 4 pm, 8 pm)
- **Y axis** = Relative Load Index, 0–100 (100 = max ever recorded for this corridor)
- **Dynamic caption** = Automatically computed sentence about peak conditions

**How to read it:** Follow the navy line from left to right. It tells you: "At 8 AM on a weekday, this corridor is at RCI 82 — that's Very Crowded territory. By 2 PM it drops to RCI 46 — Not Crowded. It climbs again to RCI 94 at 6 PM — peak of the day."

The gap between the two lines at any given hour shows how much quieter the same route is on weekends.

---

### B. 3-Segment Discrete Crowd Indicator (`CrowdIndicator`)

**Found on:** Every journey card, comparison table, itinerary header, stop details

**What you see:**
```
[█ ░ ░]  Not crowded        (Green  #15803D — 1 of 3 segments filled)
[█ █ ░]  Fairly crowded     (Amber  #B45309 — 2 of 3 segments filled)
[█ █ █]  Very crowded       (Red    #B91C1C — all 3 segments filled)
[░ ░ ░]  Not enough data    (Grey   #64748B — no segments filled)
```

**Why discrete segments, not a continuous gradient?** Colorblind commuters and users reading in direct sunlight (at a bus stop) can tell the level by counting filled blocks, without relying on color alone. This is WCAG 2.2 AA compliant.

---

### C. Time Breakdown Proportion Bar (`TimeBreakdownBar`)

**Found on:** Inside each expanded journey card

**What you see:** A single horizontal bar proportionally divided:
- **Grey segment** = Walking time (minutes to/from the stop)
- **Amber segment** = Waiting time (standing at the stop)
- **Teal segment** = Ride time (actually on the bus, moving)

**Why this matters:** A "40 minute journey" could be: 2 min walk + 20 min wait + 18 min ride (mostly standing outside, frustrating) vs. 5 min walk + 5 min wait + 30 min ride (mostly comfortable on the bus). This bar makes the difference immediately visible.

---

### D. Network Crowding Distribution Bar

**Found on:** Network Analytics → Overview tab

**What you see:** A single horizontal stacked bar across the full Delhi network:
- 🟢 ~54% = Off-peak hours where seats are generally available
- 🟡 ~32% = Regular hours where standing room is available
- 🔴 ~14% = Severe peak-hour congestion

**How to explain it:** "Most of the Delhi bus system, most of the time, is actually manageable — 54% of bus-hours are not crowded. The problem is concentrated into those 14% of hours during rush periods, which happen to be exactly when most people need to travel."

---

### E. Vertical Stop-to-Stop Rail

**Found on:** Route Details page stop timeline

**What you see:** A vertical line connecting all consecutive stops. Each segment of rail between Stop N and Stop N+1 is colored green, amber, or red based on estimated passenger load at the selected hour.

**How to read it:** This tells you *where* on the route it gets crowded, not just whether the route overall is busy. You might see that only the middle 10 stops of a 25-stop route are red — meaning if you board after those stops, you'll ride in a significantly emptier bus.

---

### F. Corridor Crowding Map Polylines

**Found on:** Analytics → Corridors Crowding Map tab

**What you see:** Every line on the map is a Delhi bus corridor. Its color = crowd level at the selected hour. Watching the map scrub from 8 AM to 6 PM and back is the most visceral way to understand how the city's bus network heats up and cools down.

---

### G. Route Comparison Line Chart

**Found on:** Analytics → Network Overview tab

**What you see:** 2–3 selected routes' RCI curves overlaid on the same chart. You can toggle routes on/off using pill buttons above the chart.

**How to use it:** Compare whether Route 73UP is consistently busier than Route 534 at all hours, or whether they converge at night. Toggle to see if the patterns hold on weekends.

---

## 11. Complete Glossary of Terms

| Term | Full Name | Plain-Language Meaning |
|---|---|---|
| **GTFS** | General Transit Feed Specification | The international open standard format for bus schedules. CrowdWise uses Delhi's official static GTFS for all routes, stops, timetables, and geographic shapes. |
| **ETM** | Electronic Ticketing Machine | The handheld device Delhi bus conductors carry. Records every ticket purchase: timestamp, boarding stop, fare stage, vehicle ID. CrowdWise's primary raw data source. |
| **RCI** | Relative Crowding Index | A normalized 0–100 score for passenger density. 0 = empty. 100 = most crowded ever observed. <50 = Not crowded. 50–84 = Fairly crowded. ≥85 = Very crowded. |
| **Alighting Estimation** | Passenger Exit Modeling | In Delhi, passengers buy tickets when boarding but don't scan when exiting. CrowdWise uses gravity/trip-length models to estimate at which downstream stop each passenger gets off. |
| **Running Load** | Stop-to-Stop Passenger Count | Estimated total passengers on board between Stop A and Stop B. Calculated as: `Load_B = Load_A + Boardings_A − Alightings_A`. Never allowed to go below zero. |
| **Mode A** | Observed O-D Mode | When the October 2026 feed provides origin-destination pairs directly, those are used. Most accurate. |
| **Mode B** | Hybrid Alighting Mode | A gravity/trip-length model that assigns alighting probability based on how far a passenger is likely to travel. Used when Mode A data is unavailable. |
| **Mode C** | Hare-Niemeyer Disaggregation | Proportional disaggregation across stops for sparse routes. Least data-intensive method. |
| **Scheduled Time** | GTFS Timetable Time | Departure time from the official timetable. Always labeled "scheduled" — CrowdWise never fakes live GPS vehicle locations. |
| **Data Confidence** | Statistical Reliability | A lot of data = many daily observations. Some data = moderate. Not enough data = < 10 records for this hour/route — shown in grey. |
| **Balanced Priority** | Multi-Objective Scoring | `Score = Duration + (RCI × 0.25)`. Finds routes that save real comfort for minimal time cost. |
| **Pink Pass** | Subsidized Women's Bus Pass | Delhi's free all-women bus pass. Journeys are not recorded in ETM data, so actual ridership is higher than the ticket count. Sensitivity analysis quantifies this gap. |
| **Corridor** | Route Alignment | The continuous physical road along which one or more bus routes operate (e.g., Anand Vihar to Shivaji Stadium). |
| **Detour Safety Cap** | Journey Planner Constraint | `T ≤ 1.5 × T_fastest + 10 min`. Prevents suggesting routes that are excessively slow just to avoid crowds. |
| **DPDP Act 2023** | Digital Personal Data Protection Act | Indian data privacy law. CrowdWise complies by HMAC-SHA-256 hashing all passenger IDs. No raw PII is stored or served. |
| **Spearman Rank Correlation** | ML Ranking Accuracy | ρ = 0.6879. Measures how well the model ranks corridors from least to most crowded relative to the actual data. ≥0.65 passes the hackathon threshold. |

---

## 12. Accessibility & Design System

| Feature | Detail |
|---|---|
| **High contrast** | Primary text (#202A32) = 14.1:1 ratio on white. Secondary text (#5F6B73) = 5.2:1. All above WCAG AA. |
| **Touch targets** | All interactive controls ≥ 44px height — usable on phones while walking or standing on a moving bus. |
| **Focus rings** | Every control has a 2px solid teal `:focus-visible` ring with 2px offset for keyboard/screen-reader navigation. |
| **Tabular numerals** | All times and durations use `font-variant-numeric: tabular-nums` — digits align without jittering as they change. |
| **Motion safety** | All animations are `transform` and `opacity` only, 120–280ms. Respects `prefers-reduced-motion: reduce`. |
| **Colorblind safe** | Crowd indicators use both color AND shape/count — no information is conveyed by color alone. |
| **Bilingual** | Full 1-click English ↔ हिन्दी toggle on the navbar. All labels, error messages, and content switch. |
| **Offline detection** | Automatically monitors `navigator.onLine` and shows a banner when connectivity is lost. |

---

## 13. Local Server Instructions & Key Showcase URLs

### Starting the Servers

**Backend (Flask API — Port 5000):**
```powershell
cd "c:\Users\rajsi\OneDrive\Desktop\Documents\raj\transport  hackathon\transport-stack-hackathon"
python backend/run.py
```

**Frontend (Vite React — Port 3000):**
```powershell
cd "c:\Users\rajsi\OneDrive\Desktop\Documents\raj\transport  hackathon\transport-stack-hackathon\frontend"
npm run dev
```

---

### Key Showcase URLs

| URL | What to Show |
|---|---|
| `http://localhost:3000/` | Homepage — stop search, priority picker, quick-start button, suggested hubs |
| `http://localhost:3000/results?origin_id=8256&dest_id=365&departure_time=18:00&preference=balanced` | The canonical demo route — Anand Vihar → CP at 6 PM, balanced mode |
| `http://localhost:3000/results?origin_id=8256&dest_id=365&departure_time=18:00&preference=fastest` | Same route, Fastest mode — different ranking |
| `http://localhost:3000/results?origin_id=8256&dest_id=365&departure_time=18:00&preference=least_crowded` | Same route, Least Crowded mode |
| `http://localhost:3000/route/101UP` | Route 101UP — 24h profile, weekday vs weekend chart, colored stop timeline |
| `http://localhost:3000/route/73UP` | Route 73UP — the most crowded corridor in the demo dataset |
| `http://localhost:3000/analytics` | Network Analytics — 3-tab: Overview, Operator Action Sheet, Corridors Map |
| `http://localhost:3000/about` | Data & Method page — flow diagram, coverage stats, crowd level definitions, sensitivity table |
| `http://127.0.0.1:5000/api/health` | Backend health check — confirms SQLite connected and ML model loaded |
| `http://127.0.0.1:5000/api/validation/sanity` | Live sanity check scorecard — all 10 domain checks |
| `http://127.0.0.1:5000/api/analytics/export?format=csv` | Download full network crowd estimate CSV |
