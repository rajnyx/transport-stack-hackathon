import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Cpu,
  BarChart2,
  Calendar,
  Navigation,
  ShieldAlert,
  BookOpen,
  Info,
} from 'lucide-react';
import CrowdIndicator from '../components/primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';

export default function AboutPage() {
  const { lang } = useTranslation();

  return (
    <div className="py-2 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#121e19]">
      {/* Title & Introduction matching Stitch Screenshot 4 */}
      <div className="space-y-2 border-b border-[#d8e6dd] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004327] tracking-tight">
              {lang === 'hi' ? 'डेटा और कार्यप्रणाली' : 'Data & Methodology'}
            </h1>
            <p className="text-sm text-[#404942] mt-1 max-w-2xl leading-relaxed">
              {lang === 'hi'
                ? 'CrowdWise दिखाता है कि आपके यात्रा के समय बस में आमतौर पर कितनी भीड़ होती है। यह पृष्ठ बताता है कि संख्याएँ कहाँ से आती हैं और वे क्या नहीं बता सकती हैं।'
                : 'CrowdWise shows how crowded a bus usually is at the time you travel. This page explains where the numbers come from, how the model works, and what it cannot tell you.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-xs border border-[#d8e6dd] text-xs font-semibold text-[#136c46]">
            <span className="w-2 h-2 rounded-full bg-[#136c46]"></span>
            <span>Civic Data Integrity Framework</span>
          </div>
        </div>
      </div>

      {/* Section 1: 6-Stage Process Pipeline matching Stitch */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#004327]">
            {lang === 'hi' ? 'अनुमान किस पर आधारित हैं' : 'What the estimates are based on'}
          </h2>
          <p className="text-xs sm:text-sm text-[#404942] mt-0.5 leading-relaxed">
            Ticket records from the Delhi bus system: electronic ticketing machine (ETM) transactions covering multi-week operational cycles. Routes, stops, and scheduled timetables come from official Delhi transit schedules.
          </p>
        </div>

        {/* 6 Process Nodes in a responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Node 1 */}
          <div className="bg-white rounded-xl p-3.5 border border-[#d8e6dd] shadow-xs flex flex-col justify-between hover:border-[#136c46] transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e9f7ee] text-[#004327] flex items-center justify-center mb-2">
                <Database className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-[#121e19]">Ticket records</div>
              <p className="text-[11px] text-[#707971] mt-0.5">ETM & e-tickets</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#136c46] uppercase tracking-wider">
              01 Ingestion
            </div>
          </div>

          {/* Node 2 */}
          <div className="bg-white rounded-xl p-3.5 border border-[#d8e6dd] shadow-xs flex flex-col justify-between hover:border-[#136c46] transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e9f7ee] text-[#004327] flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-[#121e19]">Cleaning</div>
              <p className="text-[11px] text-[#707971] mt-0.5">Duplicates removed</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#136c46] uppercase tracking-wider">
              02 Validation
            </div>
          </div>

          {/* Node 3 */}
          <div className="bg-white rounded-xl p-3.5 border border-[#d8e6dd] shadow-xs flex flex-col justify-between hover:border-[#136c46] transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e9f7ee] text-[#004327] flex items-center justify-center mb-2">
                <Layers className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-[#121e19]">Flow estimate</div>
              <p className="text-[11px] text-[#707971] mt-0.5">Per stop & trip</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#136c46] uppercase tracking-wider">
              03 Reconstruction
            </div>
          </div>

          {/* Node 4 */}
          <div className="bg-white rounded-xl p-3.5 border border-[#d8e6dd] shadow-xs flex flex-col justify-between hover:border-[#136c46] transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e9f7ee] text-[#004327] flex items-center justify-center mb-2">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-[#121e19]">Model</div>
              <p className="text-[11px] text-[#707971] mt-0.5">Learns patterns</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#136c46] uppercase tracking-wider">
              04 Inference
            </div>
          </div>

          {/* Node 5 */}
          <div className="bg-white rounded-xl p-3.5 border border-[#d8e6dd] shadow-xs flex flex-col justify-between hover:border-[#136c46] transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e9f7ee] text-[#004327] flex items-center justify-center mb-2">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-[#121e19]">Crowd level</div>
              <p className="text-[11px] text-[#707971] mt-0.5">Mapped low to high</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#136c46] uppercase tracking-wider">
              05 Classification
            </div>
          </div>

          {/* Node 6: Active Highlighted */}
          <div className="bg-[#145c3a] text-white rounded-xl p-3.5 border border-[#004327] shadow-md flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center mb-2">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-white">Planner</div>
              <p className="text-[11px] text-[#a2f4c3] mt-0.5">Options + tips</p>
            </div>
            <div className="mt-3 text-[10px] font-bold text-[#a2f4c3] uppercase tracking-wider flex items-center gap-1">
              <span>06 User View</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Where each number comes from */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#004327]">
          {lang === 'hi' ? 'प्रत्येक संख्या कहाँ से आती है' : 'Where each number comes from'}
        </h2>
        <div className="bg-white border border-[#d8e6dd] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#e9f7ee] text-[#404942] text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5">What it is</th>
                  <th className="py-3 px-5">Where you see it</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e6dd] text-[#121e19]">
                <tr className="hover:bg-[#e9f7ee]/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#004327] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#136c46]"></span>
                    <span>Timetable</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#404942]">Public bus timetable: routes, stops, scheduled times</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e9f7ee] text-xs font-semibold text-[#136c46]">
                      Journey options, stop list, map
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#e9f7ee]/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#004327] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#136c46]"></span>
                    <span>Ticket data</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#404942]">Historical ticket records supplied by transport agencies and operators</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e9f7ee] text-xs font-semibold text-[#136c46]">
                      Crowd level indices & profile charts
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-[#e9f7ee]/30 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#004327] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#136c46]"></span>
                    <span>Estimated</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#404942]">Worked out by machine learning models based on historical patterns</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e9f7ee] text-xs font-semibold text-[#136c46]">
                      Crowd levels, leave-earlier / leave-later suggestions
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: What the crowd levels mean */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#004327]">
            {lang === 'hi' ? 'भीड़ के स्तर का क्या अर्थ है' : 'What the crowd levels mean'}
          </h2>
          <p className="text-xs sm:text-sm text-[#404942] mt-0.5">
            Direct statistical representation of passenger density relative to standard bus floor area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Not Crowded */}
          <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#eaf5ef] text-[#25865a] font-bold text-xs">
                  Not crowded
                </span>
                <span className="text-xs font-bold text-[#707971]">0% – 45%</span>
              </div>
              <h3 className="font-bold text-sm text-[#121e19] mb-1">
                Seats Readily Available
              </h3>
              <p className="text-xs text-[#404942] leading-relaxed">
                Lower than about half of all route and hour slots in the data. Ample seating available throughout the trip with minimal boarding delay.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#d8e6dd] text-[11px] text-[#707971]">
              Recommended for relaxed commuting
            </div>
          </div>

          {/* Fairly Crowded */}
          <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fcf6e8] text-[#966a06] font-bold text-xs">
                  Fairly crowded
                </span>
                <span className="text-xs font-bold text-[#707971]">45% – 75%</span>
              </div>
              <h3 className="font-bold text-sm text-[#121e19] mb-1">
                Moderate Standing Load
              </h3>
              <p className="text-xs text-[#404942] leading-relaxed">
                In the middle range of network density. Few seats free; moderate standing passenger density with accessible aisles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#d8e6dd] text-[11px] text-[#707971]">
              Typical for midday and off-peak travel
            </div>
          </div>

          {/* Very Crowded */}
          <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fbecec] text-[#c64b4b] font-bold text-xs">
                  Very crowded
                </span>
                <span className="text-xs font-bold text-[#707971]">75% – 100%</span>
              </div>
              <h3 className="font-bold text-sm text-[#121e19] mb-1">
                Peak Passenger Compression
              </h3>
              <p className="text-xs text-[#404942] leading-relaxed">
                Among the busiest slots across Delhi. High standing load with minimal aisle room. Boarding may require waiting for the next bus.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#d8e6dd] text-[11px] text-[#707971]">
              Common during morning & evening rush hours
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#707971] leading-relaxed">
          The cut-off points are chosen to divide normal from compressed travel. Levels compare slots with each other; they reflect probabilistic capacity tiers, not absolute real-time standing passenger counts.
        </p>
      </section>

      {/* Section 4: Validation Benchmarks & Behavior Checks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#004327]">
            {lang === 'hi' ? 'मॉडल सत्यापन और व्यवहार जांच' : 'Model Evaluation & Behavioral Checks'}
          </h2>
          <p className="text-xs sm:text-sm text-[#404942] mt-0.5">
            Evaluated against unseen holdout days with strict consistency checks across Delhi transit reality.
          </p>
        </div>

        {/* 3 Validation Check Cards matching Stitch Screenshot 4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#d8e6dd] rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] bg-[#eaf5ef] text-[#25865a] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pass ✓
              </span>
              <span className="text-xs font-bold text-[#121e19]">Diurnal Twin Peak</span>
            </div>
            <p className="text-xs text-[#404942] leading-relaxed">
              Weekday morning and evening are consistently busier than midday and late night service.
            </p>
          </div>

          <div className="bg-white border border-[#d8e6dd] rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] bg-[#eaf5ef] text-[#25865a] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Pass ✓
              </span>
              <span className="text-xs font-bold text-[#121e19]">Weekend Suppression</span>
            </div>
            <p className="text-xs text-[#404942] leading-relaxed">
              Weekdays are demonstrably busier than Sundays across the entire multi-corridor network.
            </p>
          </div>

          <div className="bg-white border border-[#d8e6dd] rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] bg-[#fcf6e8] text-[#966a06] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Review ⚠
              </span>
              <span className="text-xs font-bold text-[#121e19]">Direction Asymmetry</span>
            </div>
            <p className="text-xs text-[#404942] leading-relaxed">
              Direction patterns on radial corridors: morning inbound toward Central Delhi, evening outbound to suburbs.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: What it cannot tell you */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#004327]">
          {lang === 'hi' ? 'यह क्या नहीं बता सकता है' : 'What it cannot tell you'}
        </h2>
        <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm space-y-3 text-xs text-[#404942]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#707971] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#121e19]">Tickets are not passengers: </strong>
              Some riders, such as fare-free pass holders or transfers, may be missing or counted differently in historical conductor logs.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[#707971] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#121e19]">Times are scheduled, not real-time GPS: </strong>
              Times are derived from official public bus timetables. Road traffic, diversions, and signal delays are not reflected.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart2 className="w-4 h-4 text-[#707971] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#121e19]">Historical estimates, not vehicle telemetry: </strong>
              Crowd predictions represent typical patterns for that hour and day type, not live on-bus headcounts.
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Transit Glossary */}
      <section className="space-y-3 border-t border-[#d8e6dd] pt-6 pb-6">
        <h2 className="text-lg font-bold text-[#004327]">
          {lang === 'hi' ? 'शब्दावली' : 'Transit Glossary & Operational Terms'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">ETM</strong>
            <p className="text-[#404942]">Electronic Ticketing Machine: Handheld hardware used by Delhi bus conductors to record passenger tickets.</p>
          </div>
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">Scheduled Service</strong>
            <p className="text-[#404942]">Departure and arrival times referenced directly from the published official public timetable.</p>
          </div>
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">Typical Crowding</strong>
            <p className="text-[#404942]">The statistical probability and standard load index for a given route, day type, and hourly interval.</p>
          </div>
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">RCI (Relative Crowding Index)</strong>
            <p className="text-[#404942]">Normalized 0–100 scale indicating congestion severity relative to the whole Delhi network.</p>
          </div>
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">DTC Pink Pass</strong>
            <p className="text-[#404942]">Fare-free single-journey travel passes issued to female commuters under Delhi Government policy.</p>
          </div>
          <div className="p-3.5 bg-white border border-[#d8e6dd] rounded-lg">
            <strong className="text-[#004327] block text-xs font-bold mb-1">Cluster Bus (DIMTS)</strong>
            <p className="text-[#404942]">Delhi Integrated Multi-Modal Transit System operated orange and blue feeder and trunk bus fleets.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
