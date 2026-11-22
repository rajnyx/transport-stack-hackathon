# CrowdWise — Complete Video Demo Script

> **For the person recording:** This script covers every section of the website in full detail. Read it out loud naturally — don't rush. Each section heading is a cue for where to click/navigate. Estimated total time: 4–5 minutes at a comfortable speaking pace. You can trim to 3 minutes by skipping sections marked [OPTIONAL].

---

## BEFORE YOU START — SETUP CHECKLIST

**Open only ONE tab before recording:**
- **`http://localhost:3000/`** — the homepage (landing page)

You do **NOT** need to pre-open multiple tabs! The entire demo flows naturally by clicking through the website live:
1. **Homepage** → explain search & priorities → click the demo corridor button.
2. **Results Page** → explore route cards, scrubber, interactive map, itinerary & stop flow drawer.
3. **Route Details Page** → click on a route to see the vertical timeline & 24-hour diurnal chart.
4. **Analytics Page** → click **"Analytics"** in the top navigation bar to explore the 3 tabs.
5. **Data & Method Page** → click **"Data & Method"** in the top navigation bar.

Make sure both backend and frontend servers are running:
- Backend: `http://localhost:5000/api/health`
- Frontend: `http://localhost:3000/`

---

## OPENING — The Problem (say while showing the homepage)

> *[Show the homepage. Camera on screen. Speak slowly and clearly.]*

"Every day, over four million people take a Delhi bus to work, school, or home.

But here's the problem — apps like Google Maps will tell you which bus to take and when it arrives. What they *cannot* tell you is whether that bus will be completely packed, or whether it will have seats available.

That matters a lot. If you're elderly, if you're carrying luggage, if you're pregnant — a crowded bus isn't just uncomfortable, it's sometimes impossible to ride.

This is CrowdWise. A journey planner for Delhi buses that shows you how crowded each bus will be — not just how long it takes."

---

## SECTION 1 — The Homepage (Journey Planner)

> *[Stay on the homepage. Point out each element as you describe it.]*

"The homepage opens straight to the journey planning tool — no marketing splash, no tutorials.

You have two stop search boxes — one for where you're starting, one for where you're going. I can type the name of any Delhi bus stop — all six thousand, eight hundred and sixty-two of them are in here. I can also type shortcuts like **CP** for Connaught Place, or **ISBT** for Anand Vihar, and it instantly finds the right stop.

> *[Click inside the 'From' box and show the suggested hubs dropdown]*

When I click the search box without typing anything, it shows me the most popular transit hubs in Delhi — Kashmere Gate, Anand Vihar ISBT, New Delhi Railway Station, AIIMS — the places most commuters travel to and from.

> *[Point to the swap button (⇅)]*

This swap button instantly flips origin and destination with one tap — handy if you want to plan the return journey.

> *[Point to the priority selector — Fastest / Balanced / Least Crowded]*

Now, here's what makes CrowdWise different from any other bus app. These three buttons — Fastest, Balanced, and Least Crowded — are your journey priority.

- **Fastest** finds the route that gets you there in the least time, full stop.
- **Balanced** is the default — it balances travel time against crowding. It might suggest a bus that takes 10 minutes longer, but has a seat available the whole way.
- **Least Crowded** prioritizes comfort completely. If you need a guaranteed seat, pick this.

> *[Click the demo button "Try corridor: Anand Vihar → Connaught Place (6:00 pm)"]*

There's also a quick-start button for our demo route. Let me click that now."

---

## SECTION 2 — Journey Results Page

> *[Results page loads. Wait for it to finish loading, then start speaking.]*

"This is the results page for Anand Vihar ISBT to Connaught Place — Shivaji Stadium Terminal — at six o'clock in the evening on a weekday. This is Delhi's notorious evening rush hour.

The app has found multiple bus options and ranked them. Let me walk through what you're seeing.

> *[Point to the first result card]*

**Option 1** — Route 101UP. The app tells me this bus leaves at around six PM, takes 45 minutes, covers 13 point 4 kilometers at approximately 21 kilometers per hour. But look here — **Very crowded**. The red indicator. Three filled bars. This is the fastest option, but it's the most packed bus of the bunch.

> *[Point to the second result card]*

**Option 2** — a balanced choice. This one takes 55 minutes — just 10 minutes more. But the crowding? **Fairly crowded** — only amber, two bars. The app is telling me: spend 10 more minutes, ride in comparative comfort.

> *[Point to the third result card]*

**Option 3** — the least crowded. If I need a seat — if I'm going a long distance, if I'm traveling with a child, if my legs hurt — this bus has a **green** indicator. Not crowded. One bar. The trade-off is it takes a bit longer, and I might need to wait 15 minutes for the next departure.

The app automatically picks the right option based on your priority — but you can switch between all three."

---

## SECTION 2A — Departure Time Scrubber

> *[Scroll down on the results page until you see the 'Adjust departure time' panel with the five buttons: Now / +15m / +30m / +45m / +60m]*

"Now here's a feature I want to highlight — the **Departure Time Scrubber**.

> *[Point to the five buttons: Depart now, +15m, +30m, +45m, +60m]*

These five buttons let me shift my departure time — right now they show Depart Now, plus 15 minutes, plus 30, 45, or 60 minutes. Each button shows the actual time it represents underneath.

> *[Click the +15m button and wait for results to update]*

Watch what happens when I say I'll leave 15 minutes later. The route options re-calculate. The same bus that was Very Crowded at six PM — if I leave at six fifteen, it may drop to Fairly Crowded. The crowd has partially dispersed in those 15 minutes.

This is CrowdWise's most powerful commuter feature. If you're flexible by even 15 minutes, you might completely avoid the worst of the rush.

> *[Click back to 'Depart now']*"

---

## SECTION 2B — The Interactive Map

> *[Scroll up to show the map on the results page]*

"Above the journey options is an **interactive route map** built on OpenStreetMap.

The colored line you can see drawn across Delhi is the actual path of the selected bus route. I can tap any of the small white dots along the route — each dot is a bus stop.

> *[Click a stop marker on the map to show the popup]*

Clicking a stop shows me its name, its stop ID, its sequence number on the route, how far it is from where I'm boarding, and what time the bus is scheduled to arrive there.

The map automatically zooms and fits to show the full corridor whenever I switch between route options."

---

## SECTION 2C — Stop-by-Stop Itinerary

> *[Scroll down to show the JourneyItinerary component — the vertical timeline]*

"Below the map is the **stop-by-stop itinerary** — think of it like the step-by-step view in Google Maps, but for one specific bus journey.

At the top: the route badge, departure and arrival times, total journey time, operator — in this case DTC — and total corridor distance.

Then you have the **boarding stop** shown with a teal circle — that's where I get on.

> *[Click the 'show intermediate stops' button to expand them]*

Then there are intermediate stops. I can expand these to see every single stop the bus passes through — with its sequence number, name, cumulative distance from where I boarded, and estimated arrival time.

And at the bottom, the **alighting stop** shown in navy — that's my destination, with the final arrival time and total distance.

> *[Point to the bottom of the itinerary]*

There's also a small advisory at the bottom: the estimated operating speed of the corridor — around 18 to 21 kilometers per hour depending on the route — and which passes are valid — DTC Daily or Pink Pass.

> *[Click on one of the intermediate stop names to open the Stop Flow Drawer]*

If I tap any stop, a **Stop Flow Drawer** slides in from the right. This shows me the boarding and alighting data for that specific stop at this hour of the day — how many passengers the model estimates get on here, how many get off, and what the running passenger count is after this stop. It even tells me whether this estimate came from observed ticket data or from an inferred model."

---

## SECTION 3 — Route Details Page (24-Hour Profile)

> *[Live navigation: You can either scroll down to the Route Crowding Chart right here on the Results page, or click on Route 101UP / type `http://localhost:3000/route/101UP`]*

"Now let me go deeper on a specific route. This is the **Route Details page** for Route 101UP.

> *[Point to the route header with the badge, agency name, and stop count]*

At the top: the route badge, the full agency name — Delhi Transport Corporation — and how many stops are on this corridor.

> *[Point to the Quick Route Switcher chips — 73UP, 85DOWN, 108AUP]*

These quick-switch chips let me jump between commonly showcased routes without searching.

> *[Point to the Weekday / Saturday / Sunday toggle]*

I can switch between Weekday, Saturday, and Sunday to see how crowding changes across the week.

> *[Point to the hour dropdown, currently at 6 pm (18:00)]*

And I can select any hour of the day — from midnight all the way to 11 PM.

> *[Scroll down to show the vertical stop timeline with colored segments]*

**The Vertical Stop Timeline:**

Look at this colored rail connecting all the stops on the route. Each segment between two consecutive stops is colored green, amber, or red based on estimated passenger load at six PM on a weekday.

You can see at a glance: where does the route get crowded? Not the whole route — just specific stretches. Maybe the bus fills up between Anand Vihar and ITO, then thins out toward Connaught Place. This tells you exactly *where* on the journey to expect the worst crowds."

---

## SECTION 3A — The 24-Hour Diurnal Chart

> *[Scroll to show the 24-Hour Crowding Profile chart on the right side of the Route Details page]*

"This is the chart I want you to pay close attention to — the **24-Hour Crowding Profile**.

You have two lines:
- The **dark navy line** is weekday demand.
- The **teal line** is weekend demand.

The horizontal axis is the hour of the day — midnight on the left, through the morning, afternoon, and evening.

The vertical axis is the **Relative Load Index, or RCI** — a scale from zero to one hundred. One hundred means this corridor is at its most crowded ever recorded. Zero means it's empty.

> *[Trace the navy weekday line with your finger/cursor from left to right]*

Look at the shape of the weekday line. It starts low at midnight. It climbs sharply from about seven AM — that's the morning rush. It peaks around eight or nine in the morning. Then it drops off toward midday — people are at work, school, offices. Then it climbs again from around five PM and peaks again at six PM — the evening rush. This double-peak shape is called the **twin-peak commuter phenomenon** and it's characteristic of every major city's transit system.

Now look at the teal **weekend line**. It's flatter. No sharp peaks. Generally runs about thirty to forty percent lower than the weekday line at every hour.

**Why are weekdays so much busier?** Because almost all Delhi bus commuters are daily workers and students — their travel is concentrated Monday to Friday during work and school hours. On weekends, leisure travel spreads more evenly across the day at lower volumes, so those sharp peaks just don't happen.

> *[Point to the dashed vertical line on the chart]*

The dashed vertical line shows the hour you currently have selected. The takeaway sentence below the chart title is calculated live from the actual data — it tells you in plain English what to expect at that specific time."

---

## SECTION 4 — Network Analytics

> *[Live navigation: In the top navigation bar, click "Analytics"]*

"Now let's zoom out to the entire Delhi bus network. This is the **Analytics page**.

> *[Point to the three tabs: Network Overview / Operator Action Sheet / Corridors Crowding Map]*

There are three tabs. Let me go through each one.

---

**Tab 1: Network Overview**

> *[Show the four metric cards at the top]*

At the top: four headline numbers. Routes with enough data — around three hundred and twelve at high confidence — out of Delhi's two thousand, five hundred and seventy-four total routes. Two point four million clean ticket transactions. Five weeks of data. And the ML model is active and loaded.

> *[Scroll down to the network-wide diurnal curve]*

This is the **network-wide demand curve** — the same weekday versus weekend chart, but for the entire Delhi bus network, not just one route. You can see the morning and evening peaks across all routes simultaneously.

> *[Scroll to the Most Crowded Routes table]*

**The Most Crowded Routes Table** lists Delhi's highest-demand corridors — routes 73UP, 534, 764, and others. It shows each route's direction, its peak hour, its crowd level, and its RCI score. The horizontal bars on the right give you a quick visual comparison. I can click any column header to sort the table, and clicking any route name takes me to its detail page.

> *[Scroll to the Crowd Distribution bar if visible]*

At the bottom: a horizontal bar showing what proportion of all Delhi bus operating hours fall into each category. About fifty-four percent are not crowded, thirty-two percent are fairly crowded, and fourteen percent are very crowded peak conditions. This tells you that the busiest conditions commuters fear are actually a minority of the day — the system is usable most of the time, but those two hours in the morning and evening are genuinely rough.

---

**Tab 2: Operator Action Sheet**

> *[Click the 'Operator Action Sheet' tab]*

This tab is built for **DTC transit planners**, but it's worth seeing.

It shows corridors ranked by **passenger deficit** — the gap between estimated passenger load and what the typical bus can carry. For each corridor, it calculates how many extra bus trips would be needed to handle the demand, under four scenarios: zero, ten, twenty, or thirty percent unrecorded riders.

Why those scenarios? Because Delhi's Pink Pass — the subsidized free pass for women — doesn't generate an ETM ticket. Those journeys are real, but invisible in the data. This table shows what changes in the recommendations if we assume ten or twenty percent of riders were unrecorded.

---

**Tab 3: Corridors Crowding Map**

> *[Click the 'Corridors Crowding Map' tab and wait for it to load]*

This is my favorite part of the analytics section.

> *[Point to the map showing colored polylines across Delhi]*

Every colored line on this map is a Delhi bus corridor. Green lines are not crowded. Amber lines are fairly crowded. Red lines are very crowded — at the hour and day type currently selected.

> *[Adjust the hour selector or day type toggle and watch the map update]*

Watch what happens when I change the hour. As I move from eight AM to six PM, the red lines multiply — the network heats up. As I go to ten PM, most lines turn green again.

This is the most visceral way to understand Delhi's transit crowding — you can literally see the city's bus network pulse and breathe across the day.

Clicking any corridor line opens a popup with the route name, RCI score, and a link to the full detail page."

---

## SECTION 5 — Data & Method Transparency

> *[Live navigation: In the top navigation bar, click "Data & Method"]*

"Finally, let me show you the **Data and Method page** — because CrowdWise believes in complete transparency about where every number comes from.

> *[Point to the horizontal flow diagram at the top]*

This diagram shows the full data pipeline in plain language: ticket records, cleaning and validation, flow estimation per stop and trip, the machine learning model, crowd level classification, and finally the planner.

> *[Scroll to the 'Where the data comes from' cards]*

**The data comes from two official sources:**

First — two million, five hundred and fifty-nine thousand, eight hundred and ninety-nine ETM ticket transactions from Delhi buses across the entire month of October 2026. These were supplied by the hackathon organizers and represent real conductor fare recordings.

Second — the official Delhi static GTFS feed: two thousand five hundred and seventy-four routes, six thousand eight hundred and sixty-two stops, three thousand four hundred and ninety-eight trip patterns.

> *[Scroll to the 'What the crowd levels mean' section]*

**What do the crowd levels actually mean?**

They are relative levels — not absolute seat counts. The system looks at all recorded route-hour slots historically and divides them into percentile bands:

- **Not crowded** means this slot is in the lower half of observed passenger loads — typical for early morning or late evening travel.
- **Fairly crowded** means it's in the middle range — typical for daytime and transition hours.
- **Very crowded** means it's among the busiest slots across the entire network — this is rush hour territory.

The thresholds are calibrated from the historical data, not from arbitrary numbers.

> *[Scroll to the Assumptions & Sensitivity Analysis section]*

**Sensitivity Analysis** — this is CrowdWise's intellectual honesty feature. You can toggle between Weekday and Weekend and see: what happens to our crowding estimates if ten, twenty, or thirty percent of riders were unrecorded? The table shows the answer route by route. The core conclusions — which corridors are busiest and when — hold up even under pessimistic assumptions.

> *[Scroll to the live model validation numbers if visible]*

And at the bottom, the actual ML model validation metrics pulled live from the backend: Spearman rank correlation of 0.6879, category accuracy of 99.3%, mean absolute error of 1.38 passengers. These are real numbers from the held-out test period — October 26 to 31, 2026."

---

## CLOSING

> *[Live navigation: In the top navigation bar, click "Plan Journey" or the CrowdWise logo to return to the clean homepage]*

"To summarize what CrowdWise does:

It takes two point five million real Delhi bus ticket records, reconstructs how crowded each corridor was stop-by-stop, trains a machine learning model to predict crowding for any hour and day type, and presents that to commuters as a simple three-tier indicator alongside scheduled journey times.

The result: for the first time, a Delhi commuter can answer the question — not 'when does the bus arrive?' but 'can I actually get on that bus without being crushed?'

Thank you."

---

## APPENDIX — Full Graph & Metric Reference

*(This section is for your own reference when answering questions. You don't need to read this out during the video.)*

### RCI — Relative Crowding Index
A normalized 0–100 score representing how crowded a bus corridor segment is relative to all other observed corridor-hour combinations in the dataset.
- **< 50 (Low)** → Not crowded (green)
- **50–84 (Moderate)** → Fairly crowded (amber)
- **≥ 85 (High)** → Very crowded (red)

The score is produced by the CrowdRandomForestRegressor model, then passed through a percentile calibration scaler to map raw passenger estimates onto the 0–100 scale.

### Why Weekday >> Weekend
- Delhi's bus ridership is dominated by commuters with fixed schedules (office workers, students, domestic workers).
- These groups travel heavily Monday–Friday during 7–10 AM and 5–8 PM.
- On weekends, the same people are at leisure — travel spreads across more hours at lower intensity.
- Empirical validation: weekday load is **1.68× higher** than Sunday load on average across the network (confirmed by the sanity check scorecard).

### The Departure Scrubber — How It Works
When you select +15 minutes, the app calls `GET /api/journey/plan?...&offset_minutes=15`. The backend fetches crowding estimates for the shifted time slot (e.g., 6:15 PM instead of 6:00 PM). Since peak congestion typically eases after 6:30 PM on most corridors, shifting departure by 15–30 minutes often drops the crowding by one full tier.

### Alighting Estimation — Why It's Needed
ETMs record boardings (someone pays for a ticket). They do not record alightings (there's no exit scan). To calculate running passenger load, CrowdWise must estimate when each passenger gets off. Three methods are used:
- **Mode A** — When the October 2026 feed provides origin-destination pairs for a trip, those are used directly.
- **Mode B** — A hybrid gravity/trip-length model that assigns alighting probability based on how far the passenger is likely to travel (longer trips more likely to alight at later stops).
- **Mode C** — Hare-Niemeyer proportional disaggregation, used for sparse routes.

### Running Load Conservation
The core mathematical identity: `L_s = L_{s-1} + boardings_s − alightings_s`. Two hard constraints are enforced: (1) L_s ≥ 0 at all stops (physically impossible to have negative passengers), and (2) L_terminal = 0 (everyone must get off at the last stop). These constraints ensure the model is physically coherent.

### Data Confidence Tiers
- **A lot of data** — Route + hour slot has ≥ 50 ticket observations in the historical period. High statistical reliability.
- **Some data** — 10–49 observations. Moderate reliability; estimates are somewhat blended with network heuristics.
- **Not enough data** — < 10 observations. Shown in grey with no crowd estimate. CrowdWise never fabricates a confidence level.

### DPDP Act Compliance
All passenger identifiers in the raw ETM data have been salted with HMAC-SHA-256 (64 hex character hashes). Raw PII is never stored or served by the API. The validation check confirms all hashes are exactly 64 characters. User searches and location data are processed entirely client-side — nothing is transmitted to any server beyond the journey planning API calls.
