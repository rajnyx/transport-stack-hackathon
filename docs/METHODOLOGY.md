# CrowdWise transit Demand & Crowdedness Methodology

**Transport Stack Hackathon 2026 — Track 2: Passenger Demand & Crowdedness Modeling**  
*Comprehensive Technical & Mathematical Specification*

---

## 1. Physical Mass Conservation Recurrence

Transit crowdedness cannot be reliably measured by ticket sales timestamps alone because tickets represent point acquisition events rather than instantaneous vehicle occupancy. To determine the physical onboard passenger load $L_s$ on a transit vehicle traveling through ordered stop sequence $s \in \{0, 1, \dots, N-1\}$ along a route pattern:

$$L_s = \max\left(0, L_{s-1} + b_s - a_s\right) \quad \forall s \in \{1, \dots, N-1\}$$

Where:
- $b_s$: Number of passengers boarding at stop sequence $s$.
- $a_s$: Number of passengers alighting at stop sequence $s$.
- $L_s$: Running onboard passenger load immediately upon departure from stop $s$.

### Boundary Conditions & Physical Invariants
1. **Initial Departure Condition**:
   $$L_0 = b_0 \quad (\text{with } a_0 = 0)$$
   A bus begins service empty; the initial load consists solely of boardings at the origin terminus.
2. **Terminal Clearance Invariant**:
   $$L_{N-1} = 0 \quad (\text{with } b_{N-1} = 0, \; a_{N-1} = L_{N-2})$$
   All onboard passengers must alight by the final terminus. A bus never carries passengers beyond its final scheduled stop.
3. **Physical Non-Negativity Invariant**:
   $$L_s \ge 0 \quad \forall s \in \{0, \dots, N-1\}$$
   Enforced via the $\max(0, \cdot)$ operator, ensuring stochastic variations never produce physically impossible negative loads.
4. **Corridor Mass Balance**:
   $$\sum_{s=0}^{N-1} b_s = \sum_{s=0}^{N-1} a_s$$
   Total trip alightings strictly balance total trip boardings.

---

## 2. Tri-Modal Ingestion Pipeline (Modes A, B, and C)

The ingestion engine autonomously adapts to the data granularity of input feeds without sacrificing mathematical rigor:

```
                          Raw Ticketing / Demand Feed
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
      Mode A (77.32%)            Mode B (11.06%)            Mode C (Surplus)
  Exact Origin-Destination    Boarding-Only Inferred    Aggregate Disaggregation
  s_board < s_alight known    Gravity + Rev. Symmetry    Hare-Niemeyer Quotas
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                     Physical Mass Conservation Recurrence
                   L_s = max(0, L_{s-1} + b_s - a_s), L_{N-1} = 0
```

### 2.1 Mode A: Full Origin-Destination Pairs (77.32% of Records)
In the Delhi Electronic Ticketing Machine (ETM) dataset (`October-Delhi.csv`), 1,979,418 records (77.32%) record both `start_stop_name` and `end_stop_name` matching the directional GTFS stop sequence ($s_{\text{board}} < s_{\text{alight}}$):

$$b_s = \sum_{k} \mathbb{I}(\text{origin}_k = s) \cdot \text{passenger\_count}_k$$
$$a_s = \sum_{k} \mathbb{I}(\text{destination}_k = s) \cdot \text{passenger\_count}_k$$

Where $\mathbb{I}(\cdot)$ is the indicator function. Both boardings and alightings are known with empirical certainty.

### 2.2 Mode B: Boarding-Only Inference via Hybrid Model (11.06% of Records)
For 283,240 records (11.06%), the boarding stop is verified on the transit route but the destination stop is colloquial, truncated, or unrecorded. Downstream alighting distribution $P(j \mid i)$ for candidate stops $j > i$ is computed as a convex combination of historical reverse-commute symmetry and spatial distance-decay gravity:

$$P(j \mid i) = \alpha \cdot P_{\text{rev}}(j \mid i) + (1 - \alpha) \cdot P_{\text{grav}}(j \mid i)$$

Where:
- $\alpha = 0.70$ is the empirical mixing parameter calibrated from Mode A observations.
- $P_{\text{rev}}(j \mid i) \propto B_{\text{return}}(j \to i)$ represents the probability that a passenger boarding at $i$ alights at $j$, derived from observed boardings in the complementary return direction during the corresponding commute window.
- $P_{\text{grav}}(j \mid i) \propto \exp(-\beta \cdot d(i, j))$ represents spatial exponential distance decay with parameter $\beta = 0.12\text{ km}^{-1}$, where $d(i, j)$ is road distance in kilometers along the route shape.
- Normalization ensures valid cumulative probabilities:
  $$\sum_{j > i} P(j \mid i) = 1.0$$

### 2.3 Mode C: Daily Aggregate Disaggregation via Hare-Niemeyer Algorithm
When only daily aggregate route passenger volume $D_r$ is available, demand is distributed across scheduled trips $t \in \{1, \dots, M\}$ using the integer-conserving **Hare-Niemeyer (Largest Remainder) Method**:

$$\text{Quota}_t = D_r \times \frac{w_t}{\sum_{k=1}^M w_k}$$
$$A_t = \lfloor \text{Quota}_t \rfloor$$
$$R_t = \text{Quota}_t - A_t$$

Surplus passengers $S = D_r - \sum_{t=1}^M A_t$ are allocated one by one to trips sorted by descending fractional remainders $R_t$. This guarantees that total daily passengers are strictly conserved as discrete integers without rounding distortion:
$$\sum_{t=1}^M A'_t = D_r$$

---

## 3. Verbal Confidence & Data Sparsity Thresholds

Commuters and transit operators must understand when an estimate is supported by robust empirical data versus when sample sizes are thin. CrowdWise classifies confidence into four transparent verbal tiers based on empirical ticket distributions in `October-Delhi.csv` (registered in `config/assumptions.yaml` ASM-08 to ASM-11):

| Confidence Tier | Sample Size Threshold | Commuter Verbal Rating (EN) | Commuter Verbal Rating (HI) | System UI & API Behavior |
|:---:|:---:|:---|:---|:---|
| **High** | $N \ge 100$ tickets | *"Based on a lot of data"* | *"बहुत सारे डेटा पर आधारित"* | Full crowding index, green confidence pill, detailed ticket count shown |
| **Medium** | $30 \le N \le 99$ tickets | *"Based on some data"* | *"कुछ डेटा पर आधारित"* | Full crowding index, amber confidence pill, detailed ticket count shown |
| **Low** | $10 \le N \le 29$ tickets | *"Based on little data"* | *"कम डेटा पर आधारित"* | Full crowding index, muted confidence pill; boarding advice (F9) suppressed |
| **Thin** | $N < 10$ tickets | *"Not enough data"* | *"पर्याप्त डेटा नहीं"* | Crowding level overridden to `Unknown`; occupancy % suppressed; "Not enough data" badge |

### Thin-Cell Safety Fallback Invariant
If a route-hour cell has fewer than 10 sample tickets ($N < 10$), the system strictly refuses to claim a confident prediction. The crowd category is overridden to `"Unknown"`, displaying `"Not enough data"`. Commuters are never misled by small-sample statistical noise.

---

## 4. Unrecorded Passenger Sensitivity & Pink Pass Accounting

### 4.1 Mukhyamantri Mahila Yatra Yojana (Pink Passes)
Under Delhi's Mukhyamantri Mahila Yatra Yojana, female commuters travel free of charge using zero-fare Pink Passes. Conductor ETM machines do not issue standard tickets for Pink Pass holders (only 8 zero-fare tickets exist across 2,559,899 records in `October-Delhi.csv`). Departmental farebox revenue audits indicate female ridership accounts for approximately 30% of total bus journeys in Delhi ($\gamma = 1.30$).

### 4.2 4-Scenario What-If Framework
Because unrecorded ridership varies by route and time of day, CrowdWise enforces strict scientific integrity: **we do not hardcode an unverifiable single factor**. Instead, we provide four transparent sensitivity scenarios ($u \in \{0.0, 0.10, 0.20, 0.30\}$):

- **Scenario 0% (Baseline)**: Raw ticket data as recorded by ETMs ($u = 0.00$).
- **Scenario 10%**: Moderate unrecorded volume ($u = 0.10$).
- **Scenario 20%**: Typical urban concession volume ($u = 0.20$).
- **Scenario 30% (Pink Pass Full Ceiling)**: Complete unrecorded female pass adoption ($u = 0.30, \gamma = 1.30$).

Adjusted passenger load for scenario $u$ is:
$$L_u = L \times (1 + u)$$

On the Data & Method page (`/about`) and Analytics page (`/analytics`), planners interactively inspect how corridor congestion shifts across these four scenarios.

---

## 5. Operator Action Sheet Deficit & Scheduling Mathematics

The Operator Action Sheet (`/analytics`) ranks transit corridors by passenger deficit to identify where additional bus dispatches provide the highest relief.

### 5.1 Nominal Capacity Calibration (F2)
Nominal vehicle capacity $C$ is assigned by fleet category (`config/assumptions.yaml` ASM-01 to ASM-04):
- **Standard Non-AC Bus**: $C = 60$ passengers (40 seated + 20 standing).
- **Standard AC Bus**: $C = 55$ passengers (35 seated + 20 standing).
- **Midi Feeder Bus**: $C = 35$ passengers.
- **Capacity Verified Invariant**: `capacity_verified: false` is strictly asserted on all API responses because physical bus capacities do not exist in the organizer dataset. Occupancy percentages are hidden in production commuter views.

### 5.2 Passenger Deficit Formulation
For typical passenger load per trip $L$, nominal capacity $C$, and scheduled hourly trips $S$:

$$\text{Deficit} = \begin{cases} \text{round}\left((L - C) \times S, 1\right) & \text{if } L > C \text{ and } S > 0 \\ 0.0 & \text{otherwise} \end{cases}$$

### 5.3 Indicative Additional Departures Formulation
Under unrecorded ridership scenario $u \in \{0.0, 0.10, 0.20, 0.30\}$, the required additional departures per hour $\Delta S_u$ is:

$$\Delta S_u = \begin{cases} 0 & \text{if } L(1 + u) \le C \\ \left\lceil \frac{(L(1 + u) - C) \times S}{C} - 10^{-9} \right\rceil & \text{if } L(1 + u) > C \end{cases}$$

The precision guard $-10^{-9}$ prevents IEEE 754 floating-point inaccuracies from rounding integer boundaries (such as $60.0 / 60.0 = 1.0$) up to 2.

### Monotonicity Invariant
For all corridors, additional trips strictly satisfy:
$$\Delta S_{0\%} \le \Delta S_{10\%} \le \Delta S_{20\%} \le \Delta S_{30\%}$$

Transit operators can reliably plan fleet augmentation under varying levels of pass adoption with mathematical certainty.
