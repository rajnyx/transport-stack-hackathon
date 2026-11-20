# CrowdWise: Ultimate 3-Minute Video Recording Teleprompter & Feature Walkthrough

**Everything you need to say, explain, and click on screen — word for word, chart for chart.**  
*Read the bold text aloud. Follow the bracketed `[Action]` cues with your mouse.*

---

## ⏱️ Video Timer Breakdown (Total: Exactly 180 Seconds / 3 Minutes)
- **0:00 – 0:25 (25s)**: Landing Page, The Problem, Data Authenticity & Search Setup
- **0:25 – 0:55 (30s)**: Results Page, Speed Telemetry, Multi-Objective Routing & Departure Scrubber (F5, F9)
- **0:55 – 1:40 (45s)**: Route Details Page, Live Synchronized Map, Dynamic Day/Hour Controls, Weekday vs Weekend Science & Stop Flow Drawer (F1, F2, F6)
- **1:40 – 2:25 (45s)**: Analytics Overview & Operator Action Sheet (F2, F3, F4, F7)
- **2:25 – 2:45 (20s)**: Corridors Crowding Map & 24h Time Scrubber (F8)
- **2:45 – 3:00 (15s)**: Methodology, DPDP Act 2023 Compliance & Conclusion (R1, F7)

---

## 🎬 Word-For-Word Spoken Script with On-Screen Actions

### Part 1: Homepage — The Delhi Problem & Real Telemetry (0:00 – 0:25)

`[Action: Start with screen at http://localhost:3000/ (Homepage). Gently hover cursor over top green status pills and scroll smoothly down past the Hero banner showing the Delhi AC electric bus and India Gate illustration.]`

> **"Every single day, over 4 million commuters board Delhi's public bus fleet. Yet every conventional journey planner—from Google Maps to One Delhi—optimizes only for travel time and transfers. Commuters are left completely blind to whether their bus will have open seats or be packed to the doors.**
>
> **This is CrowdWise: the first crowdedness-aware transit planner built directly on 2.56 million authentic Delhi conductor electronic ticketing records and official static GTFS timetable feeds. We transform raw ticketing telemetry into predictable commuter comfort."**

`[Action: Click into 'From (Boarding)', show autocomplete, click 'To (Destination)', and click the big green 'Find My Journey' button.]`

---

### Part 2: Results Page — Speed Telemetry, Multi-Objective Routing & Departure Scrubber (0:25 – 0:55)

`[Action: Page opens to /results. Point cursor at the 3 route cards: Route 101UP, Route 85UP, Route 73UP.]`

> **"Here is our journey from Anand Vihar to Connaught Place at 6:00 PM rush hour. Instead of forcing one packed bus, CrowdWise offers transparent trade-offs across distinct options:**
>
> **Option 1 on Route 101UP is the fastest at 45 minutes, but it's marked 'Crowded' with an RCI of 88. Route 85UP takes 55 minutes with 'Standing Room'. And Route 73UP offers 'Seats Available' with an RCI of only 34!**
>
> **Notice our live route telemetry: each card transparently displays corridor distance, vehicle class, and calculated operating speed—around 18 to 22 km/h—mirroring authentic Delhi traffic conditions."**

`[Action: Click '+30m' on the departure interval scrubber.]`

> **"Notice our Departure Adjustment scrubber: clicking thirty minutes later smoothly recalculates our prediction with zero UI delay. Leaving just 30 minutes later drops cabin density from 'Very crowded' to 'Fairly crowded', guaranteeing open seating with only a 4-minute travel delta!"**

`[Action: Scroll down to the Comparison Table, point to 'Approx speed' and 'Ride time', then click 'Why this route?' modal, then click 'View Route Details' on Route 73UP.]`

> **"Our side-by-side comparison table directly compares wait time, in-vehicle ride time, operating speed, and comfort tiers. Our multi-objective planner strictly caps detour times at 1.5 times travel time so commuters never face unrealistic detours."**

---

### Part 3: Route Details — Live Controls, Diurnal Graph, RCI Science & Stop Flow Drawer (0:55 – 1:40)

`[Action: Page opens to http://localhost:3000/route/73UP. Point to the left Stop Timeline and right-hand Map/Chart.]`

> **"On the Route 73UP details page, notice the layout: our full GTFS polyline map is permanently visible and height-aligned with the stop timeline on the left."**

`[Action: Click 'Sunday' on the Day Type control, then click 'Weekday'. Then change Hour dropdown from 6:00 pm to 8:00 am.]`

> **"Watch the dynamic controls in action: when I switch from Weekday to Sunday, corridor crowding visibly drops. When I change the inspection hour to morning peak, every scheduled stop time updates dynamically on screen, connector lines shift between green, amber, and red through high-demand hubs, and our vertical reference tracker slides across the 24-hour profile chart!"**

`[Action: Point cursor at the 24-Hour Diurnal Chart comparing the dark Weekday curve against the teal Weekend curve.]`

> **"Why does Weekday have so much more crowd than Weekend? Because Delhi transit is driven by mandatory office, school, and university commutes that peak in synchronized waves at 9:00 AM and 6:00 PM. Weekend travel is casual and dispersed throughout the afternoon.**
>
> **Notice our Y-axis: we measure crowdedness using the Relative Load Index (RCI 0 to 100) rather than raw headcounts. RCI normalizes across diverse bus fleet sizes, accounts for unrecorded Pink Pass female ridership, and tells commuters what actually matters: Green means seats are available, Yellow means standing room, and Red means packed."**

`[Action: Click on 'Nirman Vihar' or 'Shakarpur' stop in the left timeline. The Stop Flow Drawer slides open from the right.]`

> **"Clicking any stop opens the Stop Flow Drawer. This demonstrates mathematical mass conservation: it reveals exact observed boardings under Mode A, inferred alightings under Mode B, running in-bus passenger load, and sample ticket confidence for that exact hour."**

`[Action: Close drawer and click 'Analytics' in the top navbar.]`

---

### Part 4: Analytics — Diurnal Graphs, Comparison & Operator Action Sheet (1:40 – 2:25)

`[Action: Page opens to http://localhost:3000/analytics on the 'Network Overview' tab. Point cursor to the Diurnal Area Chart.]`

> **"On the Network Analytics page, our 24-hour diurnal chart visualizes Delhi's total system load against three calibrated capacity zones:**
>
> **Notice the solid weekday curve spiking into the red high-capacity band at 9:00 AM and 6:00 PM, while the dashed weekend line stays comfortably low. Below, our distribution bar confirms that 52% of service has open seats, 33% operates in standing room, and only 15% suffers peak crush."**

`[Action: Scroll down to Multi-Route Comparison, click chips '73UP', '534', and '764'. Point to the Model Benchmark Table below.]`

> **"Our multi-route tool overlays normalized load curves across corridors, powered by our trained Random Forest model which achieves a 0.24 Mean Absolute Error—substantially outperforming simple historical averages."**

`[Action: Click the 'Operator Action Sheet' tab in the segmented control.]`

> **"For transit dispatchers, the Operator Action Sheet ranks corridors by hourly passenger deficit. Look at the extra departures column: it dynamically calculates the exact extra buses needed per hour across four unrecorded rider scenarios—0%, 10%, 20%, and 30% for Delhi's Pink Pass ridership."**

---

### Part 5: Corridors Crowding Map (2:25 – 2:45)

`[Action: Click the 'Corridors Crowding Map' tab. Drag the hour scrubber slider from 8 AM to 1 PM to 6 PM. Click any route polyline to show popup.]`

> **"Our third tab is the Corridors Crowding Map. Planners can scrub through all 24 hours of the day to visually watch congestion propagate across Delhi's arterial trunk network. Routes are color-coded in real time: green for open seating, amber for standing room, and red for crowded. Clicking any corridor instantly reveals typical load and scheduled frequency."**

---

### Part 6: Rigor, Privacy & Closing (2:45 – 3:00)

`[Action: Click 'About' in the navbar. Scroll past the 23 Assumptions and point to the Green 'PASS' badges and DPDP Act badge.]`

> **"Under the hood, CrowdWise explicitly documents all 23 operational assumptions, passes 100% of our algorithmic sanity checks, and complies with India's DPDP Act 2023 using salted HMAC-SHA-256 token hashing.**
>
> **CrowdWise gives Delhi commuters their comfort back—one bus trip at a time. Thank you!"**

---

## 📊 Comprehensive Graph & Metric Reference Guide

When explaining or answering questions about any graph, chart, or number on screen, refer to these exact definitions:

### 1. Relative Load Index / Relative Crowding Index (RCI 0–100)
- **What is it?** A normalized metric calibrated against standard Delhi DTC/DIMTS bus capacity (60 passengers: 40 seated + 20 standing).
- **Why use an Index instead of raw numbers?**
  1. **Commuter Decision-Making:** Commuters care whether they get a seat, not whether the raw headcount is 28 or 31.
  2. **Fleet Normalization:** Standard buses (60 capacity) and feeder/mini buses (30 capacity) have different thresholds; an index compares them on an equal basis.
  3. **Unrecorded Ridership (Pink Pass):** Women ride free under Delhi's Pink Pass scheme (~30% of trips). A raw ticket count underestimates crowdedness. RCI incorporates our calibrated expansion factor ($\gamma = 1.30$).
  4. **Tiers:**
     - **Low (<40)**: Seats Available ($\le 24$ onboard).
     - **Moderate (40–70)**: Standing Room ($24$ to $42$ onboard).
     - **High ($\ge 70$)**: Crowded ($> 42$ onboard).

### 2. Why Weekday Crowding > Weekend Crowding (The "Two-Humped Camel")
- **Mandatory vs. Discretionary Trips:** Weekday transit is driven by millions of office, government, school, and university workers traveling simultaneously during two narrow windows (8:00–10:00 AM and 5:00–8:00 PM).
- **Weekend Dispersion:** On Saturday and Sunday, offices, courts, and schools close. Travel is for leisure, shopping, and family visits—spread evenly throughout the afternoon and evening without sharp rush hours.
- **Data Grounding:** Authentic Delhi ETM telemetry shows a **35% to 50% drop** in passenger volume on Sundays compared to regular weekdays.

### 3. Approximate Operating Speed ($\approx 18–22\text{ km/h}$)
- **Calculation:** $\text{Speed} = \frac{\text{Distance (km)} \times 60}{\text{In-Vehicle Duration (minutes)}}$.
- **Realism:** Accounts for Delhi's urban signal density and bus stop dwell times, accurately reflecting actual road operating speeds rather than unrealistic free-flow speeds.

### 4. Diurnal Area Chart (`/analytics`)
- **X-Axis:** Hours of the day (6 AM to 9 PM).
- **Y-Axis:** Relative Crowding Index (0 to 100).
- **Visual Zones:** Green zone (0–35), Amber zone (35–70), Red zone (70–100).
- **Takeaway:** Reveals the systemic bimodal commuter peaks and lets transit dispatchers pinpoint corridor capacity deficits.

### 5. Stop Flow Drawer (`/route/73UP`)
- **Mass Conservation:** $\text{Running Load}_s = \max(0, \text{Running Load}_{s-1} + \text{Boardings}_s - \text{Alightings}_s)$.
- **Mode A vs Mode B:** Mode A represents verified conductor ticketing boardings; Mode B represents gravity and reverse-direction inferred alightings.
