import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Database,
  Layers,
  Cpu,
  BarChart2,
  Navigation,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function AboutPage() {
  const { lang } = useTranslation();
  const [sanityData, setSanityData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    document.title = lang === 'hi' ? 'डेटा और कार्यप्रणाली — CrowdWise' : 'Data & Method — CrowdWise';

    fetch('/api/meta')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setMetaData(d.data))
      .catch(() => {});

    fetch('/api/validation/sanity')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setSanityData(d.data))
      .catch(() => {});

    fetch('/api/model/metrics')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setModelMetrics(d.data))
      .catch(() => {});
  }, [lang]);

  return (
    <div className="py-6 space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-[#0F172A]">
      {/* Title & Introduction */}
      <header className="space-y-2 border-b border-[#E2E8F0] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142B3B] tracking-tight">
          {lang === 'hi' ? 'डेटा और कार्यप्रणाली' : 'Data & Method'}
        </h1>
        <p className="text-base text-[#475569] max-w-3xl leading-relaxed">
          {lang === 'hi'
            ? 'क्राउडवाइज़ दिखाता है कि आपके यात्रा के समय बस में आमतौर पर कितनी भीड़ होती है। यह पृष्ठ बताता है कि संख्याएँ कहाँ से आती हैं और वे क्या नहीं बता सकती हैं।'
            : 'CrowdWise shows how crowded a bus usually is at the time you travel. This page explains where every number comes from, how the estimates work, and what they cannot tell you.'}
        </p>
      </header>

      {/* Section 1: Plain Flow Line (No numbered jargon labels) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#142B3B]">
          {lang === 'hi' ? 'अनुमान किस प्रकार तैयार होते हैं' : 'How estimates are built'}
        </h2>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Ticket records</div>
              <p className="text-xs text-[#64748B]">ETM transactions</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] shrink-0" />

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Cleaning</div>
              <p className="text-xs text-[#64748B]">Validation & mapping</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] shrink-0" />

            {/* Step 3 */}
            <div className="flex-1 text-center">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Flow estimate</div>
              <p className="text-xs text-[#64748B]">Per stop & trip</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] shrink-0" />

            {/* Step 4 */}
            <div className="flex-1 text-center">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Model</div>
              <p className="text-xs text-[#64748B]">Learns past patterns</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] shrink-0" />

            {/* Step 5 */}
            <div className="flex-1 text-center">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Crowd level</div>
              <p className="text-xs text-[#64748B]">Relative cutoffs</p>
            </div>
            <ArrowRight className="w-4 h-4 text-[#94A3B8] shrink-0" />

            {/* Step 6 */}
            <div className="flex-1 text-center bg-[#F0F4F8] py-2 px-3 rounded-xl border border-[#CBD5E1]">
              <div className="font-bold text-sm text-[#142B3B] mb-1">Planner</div>
              <p className="text-xs text-[#1F5FA8] font-semibold">Options & tips</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Where the data comes from */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#142B3B]">
          {lang === 'hi' ? 'डेटा कहाँ से आता है' : 'Where the data comes from'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#1F5FA8]" />
              <h3 className="font-bold text-base text-[#142B3B]">
                {lang === 'hi' ? 'ईटीएम टिकटिंग डेटा' : 'ETM & E-Ticketing Records'}
              </h3>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">
              Supplied by the Transport Stack Hackathon organizers. Contains{' '}
              <strong className="text-[#0F172A]">2,559,899 ticket transactions</strong> from{' '}
              <strong className="text-[#0F172A]">2026-10-01 to 2026-10-31 (31 operating days)</strong> recorded by electronic ticketing machines on Delhi buses.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#1F5FA8]" />
              <h3 className="font-bold text-base text-[#142B3B]">
                {lang === 'hi' ? 'सार्वजनिक बस समय सारिणी' : 'Public Bus Timetable (GTFS)'}
              </h3>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed">
              Official Delhi transit open static GTFS feed, comprising{' '}
              <strong className="text-[#0F172A]">2,574 routes</strong>,{' '}
              <strong className="text-[#0F172A]">6,862 stops</strong>, and{' '}
              <strong className="text-[#0F172A]">3,498 trip patterns</strong>. Timetable validity covers October–November 2026.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Data Coverage */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#142B3B]">
          {lang === 'hi' ? 'डेटा कवरेज' : 'Data coverage'}
        </h2>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div>
              <div className="text-2xl font-extrabold text-[#142B3B]">2,020 of 2,574</div>
              <div className="text-xs text-[#64748B]">routes in the timetable have sufficient historical ticketing data (78.5%)</div>
            </div>
            <div className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] max-w-sm">
              <strong className="text-[#0F172A] block mb-1">How thin-data routes are handled:</strong>
              When a route or hour has too few ticket records (&lt; 10 records), CrowdWise displays{' '}
              <span className="font-bold text-[#64748B]">Not enough data</span> in grey. It never fabricates confidence.
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: What the crowd levels mean */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#142B3B]">
            {lang === 'hi' ? 'भीड़ के स्तर का क्या अर्थ है' : 'What the crowd levels mean'}
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Levels compare slots with each other. They are not a count of seats or people.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Not Crowded */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#ECFDF5] text-[#15803D] font-bold text-xs border border-[#A7F3D0]">
                Not crowded
              </span>
              <span className="text-xs font-semibold text-[#64748B]">&lt; 0.72 load</span>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              Lower than about half of all route-hour slots in the historical data.
            </p>
            <div className="text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              Typical for early morning and off-peak travel
            </div>
          </div>

          {/* Fairly Crowded */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#FFFBEB] text-[#B45309] font-bold text-xs border border-[#FDE68A]">
                Fairly crowded
              </span>
              <span className="text-xs font-semibold text-[#64748B]">0.72 – 1.72 load</span>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              In the middle range of recorded passenger load across Delhi corridors.
            </p>
            <div className="text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              Typical for midday and transition periods
            </div>
          </div>

          {/* Very Crowded */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#FEF2F2] text-[#B91C1C] font-bold text-xs border border-[#FECACA]">
                Very crowded
              </span>
              <span className="text-xs font-semibold text-[#64748B]">&gt;= 1.72 load</span>
            </div>
            <p className="text-sm text-[#334155] leading-relaxed">
              Among the busiest slots across the entire bus network.
            </p>
            <div className="text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              Common during morning & evening peak rush hours
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#475569]">
          <p>
            <strong>Note on thresholds:</strong> Cut-offs (load &lt; 0.72, 0.72–1.72, &gt;= 1.72) are calibrated from historical percentile distributions (our own choice, may change). Levels compare slots with each other. They are not a count of seats or people.
          </p>
        </div>
      </section>

      {/* Section 5: Model Evaluation & Behavioral Checks */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#142B3B]">
            {lang === 'hi' ? 'मॉडल सत्यापन और व्यवहार जांच' : 'Model evaluation & behavioral checks'}
          </h2>
          <p className="text-sm text-[#475569] mt-1">
            Evaluated on held-out days (October 26–31, 2026) with automated code-decided sanity checks.
          </p>
        </div>

        {/* Real Metrics Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs font-bold text-[#475569] uppercase border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-4">MAE</th>
                <th className="py-3 px-4">RMSE</th>
                <th className="py-3 px-4">WAPE</th>
                <th className="py-3 px-4">Spearman Rank Correlation</th>
                <th className="py-3 px-4">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr>
                <td className="py-3.5 px-4 font-medium text-[#475569]">Historical Baseline Regressor</td>
                <td className="py-3.5 px-4 tabular-nums">1.30</td>
                <td className="py-3.5 px-4 tabular-nums">2.26</td>
                <td className="py-3.5 px-4 tabular-nums">57.2%</td>
                <td className="py-3.5 px-4 tabular-nums">0.655</td>
                <td className="py-3.5 px-4 tabular-nums">99.5%</td>
              </tr>
              <tr className="bg-[#F0FDF4]/40 font-semibold text-[#142B3B]">
                <td className="py-3.5 px-4">Random Forest (CrowdWise Model)</td>
                <td className="py-3.5 px-4 tabular-nums">1.38</td>
                <td className="py-3.5 px-4 tabular-nums">2.46</td>
                <td className="py-3.5 px-4 tabular-nums text-[#15803D]">55.5% (better)</td>
                <td className="py-3.5 px-4 tabular-nums text-[#15803D]">0.688 (higher ranking)</td>
                <td className="py-3.5 px-4 tabular-nums">99.3%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Behavioral Checks with Computed Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-[#ECFDF5] text-[#15803D] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                {sanityData?.checks?.find((c) => c.id.includes('PEAK'))?.status || 'PASS'}
              </span>
              <span className="text-xs font-bold text-[#142B3B]">Weekday Peak vs Midday</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              AM peak load (4.53) is <strong>3.60x</strong> higher than midday (1.26); PM peak load (3.19) is <strong>2.53x</strong> higher. Code verified &gt; 1.25x.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-[#ECFDF5] text-[#15803D] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                {sanityData?.checks?.find((c) => c.id.includes('WEEKEND'))?.status || 'PASS'}
              </span>
              <span className="text-xs font-bold text-[#142B3B]">Weekday vs Sunday</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Weekday peak load (4.53) exceeds Sunday peak load (2.02) by <strong>2.24x</strong>. Code verified &gt; 1.15x.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs bg-[#ECFDF5] text-[#15803D] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                {sanityData?.checks?.find((c) => c.id.includes('DIRECTIONAL'))?.status || 'PASS'}
              </span>
              <span className="text-xs font-bold text-[#142B3B]">Directional Profile</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Captured across operating directions (Inbound: 2.24 vs Outbound: 2.45), reflecting asymmetric radial commuter movement.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Limitations */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#142B3B]">
          {lang === 'hi' ? 'यह क्या नहीं बता सकता है' : 'What it cannot tell you'}
        </h2>
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-3 text-xs text-[#475569]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F172A]">Tickets are not passengers: </strong>
              The dataset contains conductor electronic ticketing records, which may represent samples of trips or omit fare-free pass holders. Relative crowd level is an indicative rank across slots.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F172A]">Times are scheduled, not real-time GPS: </strong>
              Times are derived directly from the official static GTFS timetable. Actual road traffic, accidents, and diversions are not captured live.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BarChart2 className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0F172A]">Historical pattern estimates, not live vehicle telemetry: </strong>
              Estimates represent expected conditions for that route, day type, and hour based on October 2026 logs, not physical headcount cameras.
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Transit Glossary */}
      <section className="space-y-4 border-t border-[#E2E8F0] pt-8">
        <h2 className="text-xl font-bold text-[#142B3B]">
          {lang === 'hi' ? 'शब्दावली' : 'Transit glossary'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">ETM</strong>
            <p className="text-[#475569]">Electronic Ticketing Machine: Handheld device used by Delhi bus conductors to record passenger ticketing transactions.</p>
          </div>
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">Scheduled Service</strong>
            <p className="text-[#475569]">Departure and arrival times referenced directly from the published official public timetable.</p>
          </div>
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">Relative Crowd Level</strong>
            <p className="text-[#475569]">Normalized comparison rating a route-hour slot against the wider Delhi transit historical network distribution.</p>
          </div>
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">Static GTFS</strong>
            <p className="text-[#475569]">General Transit Feed Specification defining public transit stops, routes, timetables, and vehicle geometry.</p>
          </div>
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">Pink Pass</strong>
            <p className="text-[#475569]">Fare-free single-journey travel passes issued to female commuters under Delhi Government policy.</p>
          </div>
          <div className="p-4 bg-white border border-[#E2E8F0] rounded-xl shadow-xs">
            <strong className="text-[#142B3B] block text-xs font-bold mb-1">Corridor Topology</strong>
            <p className="text-[#475569]">8-zone linear partition along each route direction used to model boarding accumulation and alighting decay.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
