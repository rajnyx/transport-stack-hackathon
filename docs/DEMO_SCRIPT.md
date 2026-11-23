# CrowdWise — 4:30 Video Demo Script (Strictly Under 5 Minutes)

> **⏱️ Target Runtime:** **4 minutes 20 seconds – 4 minutes 30 seconds** (buffer of 30+ seconds to stay safely under 5:00).  
> **🎯 Core Focus:** Source-to-destination crowdedness prediction, the 3-tier commuter trade-off, departure time scrubber, stop-level mass conservation, and twin-peak diurnal profiles.  
> **💡 How to use:** Spoken words are in quotes. Actions you perform on screen are in `> [ACTION: ...]`. Keep an eye on the timestamps on the left to stay on pace.

---

## SETUP (Before Clicking Record)

1. Open **only one tab**: `http://localhost:3000/` (homepage).
2. Ensure backend (`python backend/run.py`) and frontend (`npm run dev`) are running.

---

### [0:00 – 0:30] Introduction: The Transit Dilemma

> *[ACTION: Show Homepage at `http://localhost:3000/`. Keep mouse steady.]*

"Every day, over four million commuters travel on Delhi's public buses.

Existing transit apps like Google Maps or One Delhi tell you when a bus might arrive, but they have a blind spot: they cannot tell you how crowded that bus will be. For elderly commuters, women, parents with children, or daily office-goers, boarding an overcrowded bus isn't just uncomfortable — it's often physically impossible.

This is **CrowdWise** — a crowdedness-aware bus journey planner for Delhi that models passenger load stop-by-stop, allowing commuters to choose between fastest, balanced, or seat-available trips before stepping out."

---

### [0:30 – 1:15] Homepage: Source-to-Destination Planner

> *[ACTION: Click inside "From (Origin)" input. Show suggested hubs list. Then click the demo button "Try corridor: Anand Vihar → Connaught Place (6:00 pm)".]*

"The homepage is built for immediate utility. 

You can search across all six thousand, eight hundred and sixty-two Delhi bus stops, with instant matching for colloquial abbreviations like **CP** for Connaught Place or **ISBT** for Anand Vihar. Clicking an empty input reveals Delhi's major transit interchanges.

Here at the bottom, commuters select their journey priority:
- **Fastest** minimizes travel duration strictly.
- **Seat Available** prioritizes buses with available seating and minimal crowding.
- **Combo (Balanced)** is our multi-objective default — trading a few minutes of travel time for major comfort gains.

Let's click the demo shortcut: **Anand Vihar to Connaught Place** during the six PM weekday evening rush."

---

### [1:15 – 2:10] Results Page: The 3-Tier Commuter Trade-off

> *[ACTION: Results page loads. Point to the top filter pills, then point to Route 73 Express, Route 85 Regular, and Route 943UP cards.]*

"Here are the ranked journey options for Delhi's busiest commute corridor:

Notice the clear trade-off between time and crowding:

- **Route 73 Express (73UP)** is the **Fastest** option: forty minutes. But notice the red indicator: **Crowded** with a Relative Crowding Index of eighty-eight. It gets you there quickest, but with intense crushing through the middle corridor.
- **Route 85 Regular (85DOWN)** offers **Standing Room** at fifty minutes with moderate amber crowding.
- And **Route 943UP** is our top **Seat Available** recommendation: fifty-one minutes with a green indicator, **Seats Available**, and an RCI of only eight. For just ten extra minutes of commute, a rider gets guaranteed comfort and open seating.

Commuters can switch priorities anytime with the filter pills at the top — **Fastest**, **Balanced**, or **Seat Available** — or tap **Compare top 3** for an instant side-by-side matrix comparing travel time, crowd level, and onboard load."

---

### [2:10 – 2:55] Departure Scrubber & Stop Flow Conservation

> *[ACTION: Scroll to the Departure Scrubber. Click the "+15m" button. Then click a stop on the map, and expand a stop (e.g. Hasanpur Village) in the itinerary to open the Stop Flow Drawer.]*

"Commuters aren't locked into one departure time. With the **Departure Scrubber**, I can adjust by fifteen, thirty, forty-five, or sixty minutes. 

Watch what happens when I select **plus fifteen minutes**: the peak rush begins to disperse, and a previously crowded bus drops to comfortable levels. Shifting departure by just fifteen minutes completely transforms the ride.

Above, the interactive Leaflet map displays the exact corridor polyline with custom stop pins.

In the itinerary below, expanding intermediate stops reveals sequence, distance, and speed. Clicking a stop like **Hasanpur Village** opens the **Stop Flow Drawer**. 

Here you see physical mass conservation in action: boardings, alightings, and onboard load derived directly from electronic ticket records using the formula: Load equals previous load plus boardings minus alightings. This satisfies Track Two's core mandate: modeling true passenger accumulation stop-by-stop."

---

### [2:55 – 3:40] Route Rail & 24-Hour Weekday vs Weekend Diurnal Profile

> *[ACTION: Scroll down to the "24-Hour Crowding Profile" chart.]*

"Now let's examine corridor crowding over time.

The vertical stop rail dynamically colors each segment: green for low load, amber for moderate, and red for peak congestion — showing commuters exactly *where* along the route crowding builds up.

Below is the **24-Hour Crowding Profile** — the foundation of our temporal demand modeling:
- The **navy curve** represents **weekday demand**. Notice the classic **twin-peak commuter curve**: a sharp morning rush around eight to nine AM, a midday lull, and an intense evening peak around six PM.
- The **teal curve** represents **weekend demand**. It is thirty-five to forty percent lower throughout the day because office and school commutes drop off, resulting in a smooth leisure distribution.

The takeaway sentence below is calculated live from the data, confirming peak passenger accumulation hours."

---

### [3:40 – 4:05] Network Analytics: Operator Insights (Brief)

> *[ACTION: Click "Analytics" in top navbar. Briefly glance at Overview, click "Operator Action Sheet" tab, then click "Corridors Crowding Map" tab.]*

"Beyond individual commuters, CrowdWise equips transit planners with system-wide intelligence:

- In the **Overview**, we monitor city-wide volume across two point four million clean transactions and identify Delhi's most congested corridors.
- In the **Operator Action Sheet**, operators see frequency deficit rankings showing where extra buses should be dispatched — including sensitivity scenarios for unrecorded riders like women traveling on fare-free Pink Passes.
- And the **Corridors Crowding Map** provides dispatchers with a live spatial heat map of congestion across arterial routes."

---

### [4:05 – 4:25] Data Honesty & Conclusion

> *[ACTION: Click "Data & Method" in top navbar, then click the CrowdWise logo to return to the homepage.]*

"Finally, under **Data & Method**, CrowdWise demonstrates complete methodological honesty. 

Our models are trained on two point five six million official October 2026 ETM ticket transactions and static GTFS feeds. All passenger identifiers are salted and hashed for full DPDP Act compliance. Our Random Forest model achieves a Spearman rank correlation of zero point six nine and ninety-nine percent category accuracy.

CrowdWise turns raw ticketing transactions into actionable commuter comfort — making Delhi bus travel predictable, accessible, and dignified.

Thank you!"

---

## ⏱️ Speaker's Pacing Guide

| Time Mark | Section | Screen | Word Count | Focus |
|:---|:---|:---|:---:|:---|
| **0:00 – 0:30** | Problem Statement & Hook | Homepage (`/`) | ~75 words | Commuter pain point |
| **0:30 – 1:15** | Stop Search & 3 Priorities | Homepage (`/`) | ~95 words | Core Planner input |
| **1:15 – 2:10** | 3 Journey Options (Fastest / Balanced / Seat Available) | Results (`/results`) | ~115 words | **Core Solution: Trade-offs** |
| **2:10 – 2:55** | Scrubber (+15m), Map & Stop Flow Conservation | Results (`/results`) | ~105 words | **Core Solution: Flow Physics** |
| **2:55 – 3:40** | Route Rail & 24h Weekday vs Weekend Diurnal Profile | Results (`/results`) | ~110 words | **Core Solution: Diurnal Curves** |
| **3:40 – 4:05** | Analytics (Overview, Action Sheet, Map) | Analytics (`/analytics`) | ~65 words | Extra features (Fast) |
| **4:05 – 4:25** | Data Honesty, DPDP & Closing | Data & Method (`/about`) → Home | ~60 words | Wrap-up |
| **TOTAL** | **Full Walkthrough** | **Seamless 1-Tab Flow** | **~625 words** | **~4:25 Runtime (Safe < 5:00)** |
