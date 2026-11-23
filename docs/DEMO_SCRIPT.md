# CrowdWise — 4:30 Video Demo Script (Under 5 Minutes)

> **⏱️ Target Runtime:** **4 minutes 30 seconds** (buffer of 30 seconds to stay safely under 5:00).  
> **🎯 Core Focus:** Source-to-destination crowdedness, the 3-tier commuter trade-off, departure time scrubber, route corridor crowding, and twin-peak diurnal profiles.  
> **💡 How to use:** Spoken words are in quotes. Navigation cues are in `> [ACTION: ...]`. Keep an eye on the timestamps on the left to stay on pace.

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

> *[ACTION: Click inside "From" stop. Show the suggested hubs list, then click the demo button "Try corridor: Anand Vihar → Connaught Place (6:00 pm)".]*

"The homepage is built for immediate utility. 

You can search across all six thousand, eight hundred and sixty-two Delhi bus stops, with instant matching for colloquial abbreviations like **CP** for Connaught Place or **ISBT** for Anand Vihar. Clicking an empty input reveals Delhi's major transit interchanges.

Here at the bottom, commuters select their journey priority:
- **Fastest** minimizes travel duration strictly.
- **Seat Available** prioritizes buses with available seating and minimal crowding.
- **Combo (Balanced)** is our multi-objective default — trading a few minutes of travel time for major comfort gains.

Let's launch our canonical showcase: Anand Vihar to Connaught Place during the six PM weekday evening rush."

---

### [1:15 – 2:05] Results Page: The 3-Tier Commuter Trade-off

> *[ACTION: Results page loads. Point to Option 1, Option 2, and Option 3 cards in order.]*

"Here are the ranked journey options for Delhi's busiest commute hour:

**Option 1 — Route 101UP** is the **Fastest**: forty-five minutes at twenty-one kilometers per hour. But notice the red indicator: **Very Crowded** with a Relative Crowding Index of eighty-eight. It gets you there quickest, but with intense crushing through the middle corridor.

**Option 2 — Route 85UP** is the **Balanced** recommendation: fifty-five minutes. For just ten extra minutes of commute, crowding drops to amber — **Fairly Crowded** with guaranteed standing room.

**Option 3 — Route 73UP** is the **Seat Available** option: green indicator, **Seats Available** with an RCI of only thirty-four. If you have luggage or need to sit, this is your route.

Notice the filter pills above the results — **Fastest**, **Balanced**, and **Seat Available** — letting commuters filter instantly, or tap **Compare** for a side-by-side trade-off matrix.

CrowdWise empowers commuters with clear choices instead of blind guesswork."

---

### [2:05 – 2:50] Departure Scrubber, Interactive Map & Stop Flow

> *[ACTION: Scroll to the Departure Scrubber. Click the "+15m" button. Then click a stop marker on the map, and expand a stop in the itinerary.]*

"Commuters aren't locked into one departure time. With the **Departure Scrubber**, I can adjust by fifteen, thirty, forty-five, or sixty minutes. 

Watch what happens when I select **plus fifteen minutes**: the evening rush begins to disperse, and a previously crowded bus drops to comfortable levels. Leaving just fifteen minutes later completely transforms the ride.

Above, the interactive Leaflet map displays the exact corridor polyline with custom stop pins. Clicking any pin shows scheduled arrival and distance.

In the Moovit-style itinerary below, expanding intermediate stops reveals sequence, cumulative distance, and speed. Tapping any stop opens the **Stop Flow Drawer**, proving physical mass conservation — stop-level boardings, alightings, and onboard load derived directly from ticket records."

---

### [2:50 – 3:40] Route Details: Stop-Level Colors & 24-Hour Diurnal Profile

> *[ACTION: Scroll to the 24-Hour Crowding Profile chart on the page, or click Route 101UP.]*

"Now let's examine route-level crowding.

The vertical stop rail dynamically colors each corridor segment: green for low load, amber for moderate, and red for peak congestion. This shows commuters exactly *where* along the route crowding peaks and clears.

Here is the **24-Hour Crowding Profile** — the core of our temporal demand modeling:
- The **navy curve** represents **weekday demand**. Notice the classic **twin-peak commuter curve**: a sharp morning rush around eight to nine AM, a midday lull, and an intense evening peak around six PM.
- The **teal curve** represents **weekend demand**. It is thirty-five to forty percent lower throughout the day because Delhi's work and school commutes drop off, leaving a smooth, flatter leisure distribution.

The takeaway sentence below is calculated live from the data, confirming peak passenger accumulation."

---

### [3:40 – 4:10] Network Analytics: City-Wide Congestion & Operator Actions

> *[ACTION: Click "Analytics" in top navbar. Briefly glance at Overview, click "Operator Action Sheet" tab, then click "Corridors Crowding Map" tab.]*

"In the top navigation bar, let's open **Analytics** for network-wide visibility:

In the **Overview**, we track city-wide volume across two point four million clean transactions, the full network diurnal curve, and a sortable table of Delhi's most congested corridors.

The **Operator Action Sheet** provides transit operators with deficit-ranked scheduling insights, showing where extra bus trips are needed — including sensitivity scenarios for unrecorded riders like women traveling on fare-free Pink Passes.

The **Corridors Crowding Map** provides a live geographic heat map of Delhi's arterial bus corridors color-coded by crowd tier, giving transit authorities instant spatial awareness."

---

### [4:10 – 4:30] Data Honesty & Conclusion

> *[ACTION: Click "Data & Method" in navbar, then click the logo/Plan Journey to finish on clean screen.]*

"Finally, under **Data & Method**, CrowdWise demonstrates complete intellectual honesty. 

Our models are trained on two point five six million official October 2026 ETM ticket transactions and static GTFS feeds. All passenger identifiers are salted and hashed for full DPDP Act compliance. Our Random Forest model achieves a Spearman rank correlation of zero point six nine and ninety-nine percent category accuracy.

CrowdWise turns raw ticketing transactions into actionable commuter comfort — making Delhi bus travel predictable, accessible, and dignified.

Thank you!"

---

## ⏱️ Speaker's Pacing Guide

| Time Mark | Section | Screen | Word Count |
|:---|:---|:---|:---:|
| **0:00 – 0:30** | Problem Statement & Hook | Homepage (`/`) | ~75 words |
| **0:30 – 1:15** | Stop Search & 3 Priorities | Homepage (`/`) | ~95 words |
| **1:15 – 2:05** | 3 Journey Options (Fastest / Balanced / Seat Available) | Results (`/results`) | ~115 words |
| **2:05 – 2:50** | Scrubber (+15m), Map & Stop Flow | Results (`/results`) | ~105 words |
| **2:50 – 3:40** | Route Timeline & 24h Weekday vs Weekend Profile | Results / Route Details | ~115 words |
| **3:40 – 4:10** | Analytics (Overview, Action Sheet, Map) | Analytics (`/analytics`) | ~80 words |
| **4:10 – 4:30** | Data Honesty, DPDP & Closing | Data & Method (`/about`) → Home | ~65 words |
| **TOTAL** | **Full Complete Walkthrough** | **Seamless UI Flow** | **~645 words (~4:25)** |
