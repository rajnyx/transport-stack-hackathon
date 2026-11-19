# MANUAL_TODO.md — Owner Action Checklist

This document details the exact items that require manual owner intervention, why they are needed, and the autonomous fallback in place.

---

## Summary: What the System Handles vs. What the Owner Needs to Do

| Category | What the System Does (100% Complete) | What YOU (Owner) Need to Do |
|---|---|---|
| **Code & Architecture** | 100% complete (Frontend, Backend, ML, Scripts) | None |
| **GTFS Static Data** | Ingested full official Delhi GTFS (6,862 stops, 2,574 routes) | None |
| **Ticketing Data** | Ingested 2,559,899 October ETM records into 3.32M facts | None |
| **Model Retraining** | Retrained Random Forest (34.4 MB) & RCI Calibrator | None |
| **Testing & Sanity** | 100% automated pytest (489/489), smoke tests, & sanity checks | None |
| **Submission Pack** | Drafted 2-page Proposal (`docs/PROPOSAL.md`, `PROPOSAL.html`), Technical Note (`docs/TECHNICAL_NOTE.md`), and 3-minute video script (`docs/DEMO_SCRIPT.md`) | Review, record 3-min video, & submit on portal |
| **Deployment Prep** | Configured for local running, Docker, Vercel, and Render | Optional: add cloud credentials if hosting live |

---

## Action Items for Owner (Submission Checklist)

### 1. What is the "Proposal" and What Do You Submit?
- **What it is:** The hackathon portal asks teams to submit a formal **written proposal / technical brief** explaining your approach to Problem Statement 2 (Crowdedness-Aware Bus Journey Planner).
- **Status:** We have written a comprehensive, rigorous proposal ready for you:
  - Markdown version: [`docs/PROPOSAL.md`](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/transport  hackathon/transport-stack-hackathon/docs/PROPOSAL.md)
  - Styled HTML/PDF-ready version: [`docs/PROPOSAL.html`](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/transport  hackathon/transport-stack-hackathon/docs/PROPOSAL.html)
  - Technical methodology note: [`docs/TECHNICAL_NOTE.md`](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/transport  hackathon/transport-stack-hackathon/docs/TECHNICAL_NOTE.md)
- **Your Action:** Open `docs/PROPOSAL.md` (or open `docs/PROPOSAL.html` in your browser and print to PDF), add your team name and member details, and upload it to the hackathon submission form.

### 2. What is the "3-Minute Video Script"?
- **What it is:** The hackathon organizers typically require a short **3-minute screen recording / video walkthrough** showing that your application actually works, takes user input, shows crowdedness levels, and explains the trade-offs.
- **Status:** We prepared [`docs/DEMO_SCRIPT.md`](file:///c:/Users/rajsi/OneDrive/Desktop/Documents/raj/transport  hackathon/transport-stack-hackathon/docs/DEMO_SCRIPT.md), which gives you:
  - Exact second-by-second timestamps (0:00 to 3:00).
  - Exact buttons to click on screen (e.g. Anand Vihar to Connaught Place at 18:00, toggling "Least Crowded", viewing route corridor, viewing network analytics).
  - Word-for-word voiceover script so you don't have to stumble or guess what to say.
- **Your Action:**
  1. Start the backend (`python backend/run.py`) and frontend (`npm run dev` in `frontend/`).
  2. Open OBS Studio, Loom, or Windows Game Bar (`Win + Alt + R`).
  3. Follow `docs/DEMO_SCRIPT.md` to click through the pages while reading the script.
  4. Upload the video to YouTube (unlisted) or Google Drive, and paste the link into the submission form.

### 3. Official Organizer Dataset Status
- **Status:** **PROCESSED, RETRAINED & 100% ACTIVE IN PRODUCTION**.
- **Dataset:** `data/raw/organizer/October-Delhi.csv` (2,559,899 ETM tickets, 31 full days of October 2026).
- **Execution:** 3,322,312 corridor zone demand facts seeded in `backend/crowdwise.db`.
- **Model:** Random Forest regressor (34.4 MB) retrained on 2.22M train rows, verified on 672k held-out test rows, RCI calibrated 0–100.
- **Provenance:** `data_mode = 'organizer'`, `active_tier = 'organizer'`. Zero synthetic data.

### 4. Vehicle Capacity & Pink Pass Assumptions
- **Configured Values:**
  - Standard bus capacity: 60 passengers (40 seated + 20 standing).
  - Pink Pass expansion factor: $\gamma_r = 1.30$ (accounts for Delhi's free travel scheme for women, representing ~30% of actual ridership).
- **Your Action:** If organizers specify custom bus capacity rosters, you can edit `config/capacity_by_bus_type.yaml`. Otherwise, the current documented assumptions are standard for DTC 12-meter CNG low-floor buses.

### 5. Git & Code Protection Reminder
- The GitHub remote is `https://github.com/rajnyx/transport-stack-hackathon.git` (`main` branch).
- All raw CSV and GTFS data files are preserved safely in `data/raw/`.
- Ensure your GitHub repository visibility matches organizer guidelines before submission.

### 6. Native Speaker Review of Hindi Translations (`frontend/src/i18n/hi.json`)
- **Status:** **DRAFTED & ACTIVE IN APPLICATION**.
- **Scope:** Complete bilingual UI dictionaries (`frontend/src/i18n/hi.json` and `en.json`).
- **Standardized Crowd Labels:**
  - Low $\rightarrow$ कम भीड़
  - Moderate $\rightarrow$ मध्यम भीड़
  - High $\rightarrow$ ज़्यादा भीड़
  - Insufficient data $\rightarrow$ पर्याप्त डेटा नहीं
  - Timetable scheduled $\rightarrow$ निर्धारित समय
  - Historical data line $\rightarrow$ इस समय के पिछले टिकट डेटा पर आधारित
- **Milestone 3 Additions (F1, F2, F5, F6, F9):**
  - `confidence.thin`: "पर्याप्त डेटा नहीं" ("Not enough data")
  - `confidence.sampleCount`: "{{count}} टिकट रिकॉर्ड" ("{{count}} ticket records")
  - `confidence.sampleTicketCount`: "नमूना टिकट संख्या" ("Sample ticket count")
  - `vehicleClass.label`: "वाहन श्रेणी" ("Vehicle class")
  - `vehicleClass.ac`: "वातानुकूलित (एसी) बस" ("AC Bus")
  - `vehicleClass.nonAc`: "साधारण बस (नॉन-एसी)" ("Standard Bus")
  - `vehicleClass.unverifiedNotice`: "नाममात्र क्षमता (असत्यापित)" ("Nominal capacity (unverified)")
  - `scrubber.title`: "प्रस्थान समय बदलें" ("Adjust departure time")
  - `scrubber.departNow`: "अभी निकलें" ("Depart now")
  - `scrubber.offset0` – `offset60`: "+0 मिनट" to "+60 मिनट"
  - `scrubber.tipsTitle`: "प्रस्थान सुझाव" ("Departure Tips")
  - `scrubber.optimalNotice`: "वर्तमान प्रस्थान समय सर्वोत्तम यात्रा स्थिति प्रदान करता है।" ("Current departure time offers optimal travel conditions.")
  - `scrubber.avoidPeak`: "इस समय प्रस्थान करने से पीक भीड़ से बचा जा सकता है" ("Departing at current offset avoids peak crowding")
  - `flow.drawerTitle`: "स्टॉप-स्तरीय यात्री प्रवाह" ("Stop-Level Passenger Flow")
  - `flow.boardings`: "चढ़ने वाले यात्री" ("Boardings")
  - `flow.alightings`: "उतरने वाले यात्री" ("Alightings")
  - `flow.runningLoad`: "सवार यात्री (रनिंग लोड)" ("Running Load")
  - `flow.sampleRecords`: "नमूना टिकट रिकॉर्ड" ("Sample ticket records")
  - `flow.attributionMode`: "आरोपण पद्धति" ("Attribution method")
  - `flow.modeA`: "मोड A (प्रत्यक्ष टिकट O-D)" ("Mode A (Observed O-D)")
  - `flow.modeB`: "मोड B (अनुमानित अलाइटिंग)" ("Mode B (Inferred Alightings)")
  - `flow.modeAExplanation`: "टिकट डेटा में दर्ज प्रत्यक्ष आरंभ-गंतव्य रिकॉर्ड" ("Directly observed passenger origin-destination ticketing telemetry")
  - `flow.modeBExplanation`: "विपरीत-दिशा प्रवाह और दूरी-क्षय मॉडल द्वारा अनुमानित अलाइटिंग" ("Alightings inferred via reverse-corridor flow and spatial gravity decay")
  - `flow.conservationVerified`: "भौतिक यात्री प्रवाह संरक्षण सत्यापित" ("Physical Flow Conservation Verified")
  - `flow.conservationFormula`: "सवार यात्री = max(0, पूर्व भार + चढ़े - उतरे)" ("Load = max(0, Previous Load + Boardings - Alightings)")
  - `boardingAdvice.title`: "वैकल्पिक बोर्डिंग सुझाव" ("Alternative Boarding Advice")
  - `boardingAdvice.walkBadge`: "पैदल दूरी पर बेहतर विकल्प" ("Walking Alternative Available")
  - `boardingAdvice.walkMessage`: "{{crowdLevel}} के लिए {{stopName}} तक {{distance}}मी पैदल चलें" ("Walking {{distance}}m to {{stopName}} offers {{crowdLevel}}")
  - `boardingAdvice.avoidCrowding`: "पैदल दूरी पर कम भीड़ वाला स्टॉप उपलब्ध है।" ("Less crowded boarding stop within walking distance.")
- **Milestone 4 Additions (F3, F4, F7, F8):**
  - `analytics.tabOverview`: "नेटवर्क अवलोकन" ("Network Overview")
  - `analytics.tabActionSheet`: "ऑपरेटर एक्शन शीट" ("Operator Action Sheet")
  - `analytics.tabMap`: "कॉरिडोर भीड़ मानचित्र" ("Corridors Crowding Map")
  - `f3.title`: "मान्यताएं और संवेदनशीलता विश्लेषण" ("Assumptions & Sensitivity Analysis")
  - `f3.subtitle`: "अदर्ज यात्री परिदृश्यों (0%, 10%, 20%, 30%) के तहत कॉरिडोर भीड़ का मूल्यांकन" ("Evaluating corridor crowdedness under unrecorded passenger scenarios (0%, 10%, 20%, 30%)")
  - `f3.rationale`: "मुख्यमंत्री महिला यात्रा योजना के अंतर्गत महिला यात्री पिंक पास द्वारा निःशुल्क यात्रा करती हैं..." ("Under the Mukhyamantri Mahila Yatra Yojana, female commuters travel fare-free via Pink Passes...")
  - `f3.weekday` / `f3.weekend`: "कार्यदिवस" / "सप्ताहांत" ("Weekday" / "Weekend")
  - `f3.baseline0` / `scenario10` / `scenario20` / `scenario30`: "मूल स्तर (0%)" to "+30% (पिंक पास)"
  - `actionSheet.tabTitle`: "ऑपरेटर एक्शन शीट" ("Operator Action Sheet")
  - `actionSheet.title`: "परिवहन संचालकों के लिए कॉरिडोर एक्शन शीट" ("Corridor Action Sheet for Transit Operators")
  - `actionSheet.subtitle`: "यात्री घाटे के अनुसार प्रति घंटा कॉरिडोर रैंकिंग..." ("Hourly corridor ranking by passenger deficit...")
  - `actionSheet.colDeficit`: "यात्री घाटा (अतिरिक्त मांग)" ("Passenger Deficit")
  - `actionSheet.colExtraTrips`: "अतिरिक्त बसें (0% / 10% / 20% / 30%)" ("Extra Trips (0% / 10% / 20% / 30%)")
  - `actionSheet.glossaryDeficitTitle` / `glossaryDeficitDesc`: "यात्री घाटा" ("Passenger Deficit")
  - `actionSheet.glossaryExtraTripsTitle` / `glossaryExtraTripsDesc`: "संकेतक अतिरिक्त बसें" ("Indicative Additional Trips")
  - `actionSheet.disclaimer`: "अक्टूबर 2026 ईटीएम टिकट नमूने पर आधारित सांकेतिक शेड्यूलिंग मॉडल..." ("Indicative scheduling model derived from October 2026 ETM sample...")
  - `export.csv`: "सीएसवी डाउनलोड करें" ("Export CSV")
  - `export.json`: "जेसन डाउनलोड करें" ("Export JSON")
  - `export.exportRouteCsv`: "मार्ग सीएसवी डाउनलोड" ("Export Route CSV")
  - `export.exportRouteJson`: "मार्ग जेसन डाउनलोड" ("Export Route JSON")
  - `export.metadataNotice`: "# Metadata: डेटा स्रोत, तिथि सीमा और लोड सत्यापन हेडर ब्लॉक शामिल है।" ("Includes # Metadata: provenance, date window, and load verification header block.")
  - `crowdingMap.tabTitle`: "कॉरिडोर भीड़ मानचित्र" ("Corridors Crowding Map")
  - `crowdingMap.title`: "योजनाकारों का नेटवर्क भीड़ मानचित्र" ("Planners Network Crowding Map")
  - `crowdingMap.subtitle`: "चयनित समय और दिन के प्रकार के लिए भीड़ के स्तर के अनुसार रंगीन दिल्ली के मुख्य बस कॉरिडोर" ("Delhi trunk corridors colored by typical crowdedness level...")
  - `crowdingMap.cappedNotice`: "सुगम प्रदर्शन हेतु शीर्ष 50 कॉरिडोर तक सीमित" ("Capped to top 50 corridors for smooth rendering")
  - `crowdingMap.legendLow` / `legendModerate` / `legendHigh`: "सीटें उपलब्ध", "खड़े होने की जगह", "ज़्यादा भीड़"
- **Your Action:** Have a native Hindi speaker do a final proofread of `frontend/src/i18n/hi.json` to ensure colloquial phrasing aligns with everyday Delhi commuter usage. Do not claim it is natively reviewed until inspected.
