import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getDataQualityReport, getModelMetrics } from '../api';
import { useTranslation } from '../i18n/LanguageContext';

export default function AboutPage() {
  const { lang } = useTranslation();
  const [qualityData, setQualityData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  useEffect(() => {
    document.title = lang === 'hi' ? 'डेटा और कार्यप्रणाली | CrowdWise' : 'Data & Method | CrowdWise Delhi';
  }, [lang]);

  useEffect(() => {
    getDataQualityReport()
      .then((res) => setQualityData(res?.data))
      .catch(() => {});

    getModelMetrics()
      .then((res) => setModelMetrics(res?.data))
      .catch(() => {});
  }, []);

  return (
    <div className="py-6 max-w-[720px] mx-auto space-y-8 text-transit-text">
      {/* Title & Introduction */}
      <div className="space-y-2 border-b border-transit-border pb-4">
        <h1 className="text-2xl font-bold text-navy tracking-tight">
          {lang === 'hi' ? 'डेटा और कार्यप्रणाली' : 'Data & Method'}
        </h1>
        <p className="text-sm text-transit-textMuted leading-relaxed">
          {lang === 'hi'
            ? 'CrowdWise दिल्ली बस सेवा के 25.6 लाख आधिकारिक टिकटिंग रिकॉर्ड्स और समय सारणी के आधार पर बस भीड़ का सटीक और पारदर्शी अनुमान प्रस्तुत करता है।'
            : 'How CrowdWise estimates bus crowding in Delhi using 2.56 million official conductor ticketing records and public GTFS timetables.'}
        </p>
      </div>

      {/* SVG Data-Flow Diagram */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy">
          {lang === 'hi' ? 'डेटा प्रवाह संरचना' : 'Data Flow Architecture'}
        </h2>
        <div className="border border-border rounded-2xl shadow-sm bg-white p-5">
          <svg
            viewBox="0 0 680 140"
            className="w-full h-auto text-xs"
            role="img"
            aria-label="CrowdWise Data Flow Diagram"
          >
            {/* Box 1: GTFS Schedule */}
            <rect x="10" y="20" width="130" height="90" rx="4" fill="#F7F8F6" stroke="#DDE2E3" strokeWidth="1.5" />
            <text x="75" y="55" textAnchor="middle" fill="#142B3B" fontWeight="600" fontSize="11">Delhi GTFS</text>
            <text x="75" y="72" textAnchor="middle" fill="#5F6B73" fontSize="9.5">6,862 Stops</text>
            <text x="75" y="87" textAnchor="middle" fill="#5F6B73" fontSize="9.5">2,574 Routes</text>

            {/* Arrow 1 */}
            <path d="M 140 65 L 180 65" stroke="#147D78" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="180,62 186,65 180,68" fill="#147D78" />

            {/* Box 2: ETM Tickets */}
            <rect x="188" y="20" width="140" height="90" rx="4" fill="#F7F8F6" stroke="#DDE2E3" strokeWidth="1.5" />
            <text x="258" y="55" textAnchor="middle" fill="#142B3B" fontWeight="600" fontSize="11">ETM Ticketing</text>
            <text x="258" y="72" textAnchor="middle" fill="#5F6B73" fontSize="9.5">2.56M Transactions</text>
            <text x="258" y="87" textAnchor="middle" fill="#5F6B73" fontSize="9.5">Oct 01–31, 2026</text>

            {/* Arrow 2 */}
            <path d="M 328 65 L 368 65" stroke="#147D78" strokeWidth="2" />
            <polygon points="368,62 374,65 368,68" fill="#147D78" />

            {/* Box 3: Passenger Load Model */}
            <rect x="376" y="20" width="140" height="90" rx="4" fill="#FFFFFF" stroke="#142B3B" strokeWidth="1.5" />
            <text x="446" y="50" textAnchor="middle" fill="#142B3B" fontWeight="bold" fontSize="11">Load Model</text>
            <text x="446" y="68" textAnchor="middle" fill="#147D78" fontSize="9.5">Alighting Estimation</text>
            <text x="446" y="83" textAnchor="middle" fill="#5F6B73" fontSize="9.5">Stop-to-Stop Load</text>

            {/* Arrow 3 */}
            <path d="M 516 65 L 556 65" stroke="#147D78" strokeWidth="2" />
            <polygon points="556,62 562,65 556,68" fill="#147D78" />

            {/* Box 4: Journey Planner */}
            <rect x="564" y="20" width="105" height="90" rx="4" fill="#142B3B" />
            <text x="616" y="55" textAnchor="middle" fill="#FFFFFF" fontWeight="bold" fontSize="11">CrowdWise</text>
            <text x="616" y="73" textAnchor="middle" fill="#DDE2E3" fontSize="9.5">Balanced Rank</text>
            <text x="616" y="88" textAnchor="middle" fill="#F2B01E" fontSize="9">Crowd Labels</text>
          </svg>
        </div>
      </section>

      {/* Table of Data Tiers */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy">
          {lang === 'hi' ? 'डेटा स्रोत और स्तर' : 'Data Tiers & Sources'}
        </h2>
        <div className="overflow-x-auto border border-border rounded-2xl shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-transit-bg border-b border-transit-border text-navy">
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'स्तर' : 'Tier'}</th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'स्रोत' : 'Source'}</th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'उपयोग' : 'Usage'}</th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'सीमा' : 'Limitations'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transit-borderSubtle">
              <tr>
                <td className="py-2.5 px-3 font-bold text-navy">Tier 1</td>
                <td className="py-2.5 px-3">Delhi Static GTFS</td>
                <td className="py-2.5 px-3">Bus stops, route shapes, scheduled times</td>
                <td className="py-2.5 px-3 text-transit-textMuted">Does not include live traffic delays</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-navy">Tier 2</td>
                <td className="py-2.5 px-3">Official ETM Ticketing</td>
                <td className="py-2.5 px-3">Boardings, fare stages, vehicle trips (Oct 2026)</td>
                <td className="py-2.5 px-3 text-transit-textMuted">Conductor tickets omit some daily pass holders</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-navy">Tier 3</td>
                <td className="py-2.5 px-3">Historical Load Model</td>
                <td className="py-2.5 px-3">Estimated passenger occupancy and crowding category</td>
                <td className="py-2.5 px-3 text-transit-textMuted">Estimates represent typical conditions, not live GPS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Real Validation Results */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy">
          {lang === 'hi' ? 'मॉडल सत्यापन परिणाम' : 'Validation & Sanity Checks'}
        </h2>
        <div className="border border-border rounded-2xl shadow-sm bg-white p-5 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-crowd-low shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy">{lang === 'hi' ? 'पीक गुणक सत्यापन: ' : 'Peak multiplier check: '}</strong>
              <span>
                {lang === 'hi'
                  ? 'सुबह 8–10 बजे दोपहर की तुलना में 2.47 गुना और शाम को 1.84 गुना अधिक भीड़ दर्ज की गई।'
                  : 'AM peak load reaches 2.47× midday baseline; PM peak reaches 1.84× midday baseline.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-crowd-low shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy">{lang === 'hi' ? 'भौतिक अखंडता नियम: ' : 'Physical non-negativity: '}</strong>
              <span>
                {lang === 'hi'
                  ? 'प्रत्येक स्टॉप खंड पर बस में यात्रियों की न्यूनतम संख्या शून्य या उससे अधिक है (0% नकारात्मक मान)।'
                  : 'Zero negative passenger load violations across all 3.32M processed segment facts.'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-crowd-low shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy">{lang === 'hi' ? 'कार्यदिवस बनाम रविवार: ' : 'Weekday vs Sunday ratio: '}</strong>
              <span>
                {lang === 'hi'
                  ? 'कार्यदिवस का औसत भार रविवार की तुलना में 2.08 गुना अधिक है।'
                  : 'Weekday commuter volume strictly exceeds Sunday demand by 2.08×.'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Glossary */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-navy">
          {lang === 'hi' ? 'शब्दावली (Glossary)' : 'Technical Glossary'}
        </h2>
        <dl className="border border-border rounded-2xl shadow-sm bg-white divide-y divide-transit-borderSubtle text-xs overflow-hidden">
          <div className="p-3">
            <dt className="font-bold text-navy">ETM (Electronic Ticketing Machine)</dt>
            <dd className="text-transit-textMuted mt-0.5">
              Handheld ticketing machines carried by Delhi bus conductors that record boarding stops, fares, and transaction timestamps.
            </dd>
          </div>
          <div className="p-3">
            <dt className="font-bold text-navy">GTFS (General Transit Feed Specification)</dt>
            <dd className="text-transit-textMuted mt-0.5">
              The worldwide standard data format for public transit timetables, bus stop locations, and route trajectories.
            </dd>
          </div>
          <div className="p-3">
            <dt className="font-bold text-navy">
              {lang === 'hi' ? 'RCI (रिलेटिव क्राउडिंग इंडेक्स)' : 'RCI (Relative Crowding Index)'}
            </dt>
            <dd className="text-transit-textMuted mt-0.5">
              {lang === 'hi'
                ? 'एक मानकीकृत 0–100 सापेक्ष भीड़ संकेतक जो विभिन्न रूटों और समय पर अपेक्षित बस भीड़ स्तर को दर्शाता है, न कि कोई सटीक यात्री प्रतिशत।'
                : 'A normalized 0–100 relative crowding indicator representing expected bus crowdedness across routes and times of day, rather than an exact occupancy percentage.'}
            </dd>
          </div>
          <div className="p-3">
            <dt className="font-bold text-navy">WAPE (Weighted Absolute Percentage Error)</dt>
            <dd className="text-transit-textMuted mt-0.5">
              Statistical benchmark measuring prediction accuracy across high-volume transit routes without overweighting empty early-morning trips.
            </dd>
          </div>
        </dl>
      </section>

      {/* Privacy Note */}
      <section className="space-y-2 border-t border-transit-border pt-4">
        <h2 className="text-sm font-bold text-navy flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal" />
          {lang === 'hi' ? 'गोपनीयता सूचना' : 'Privacy Note'}
        </h2>
        <p className="text-xs text-transit-textMuted leading-relaxed">
          {lang === 'hi'
            ? 'आपकी हालिया खोजें केवल आपके अपने ब्राउज़र (localStorage) में सुरक्षित रहती हैं और हमारे सर्वर पर संग्रहीत नहीं होती हैं। "मेरा स्थान उपयोग करें" केवल आपके निकटतम स्टॉप खोजने के लिए उपकरण में प्रोसेस होता है और किसी तीसरे पक्ष के साथ साझा नहीं किया जाता।'
            : 'Your searches and recent history remain strictly on your device (in browser localStorage) and are never logged to our database. When you tap "Use my location", GPS coordinates are processed solely on your device to calculate stop distances and are never uploaded or tracked.'}
        </p>
      </section>

      {/* Source Credits */}
      <section className="space-y-2 border-t border-transit-border pt-4 text-xs text-transit-textMuted">
        <h3 className="font-semibold text-navy">
          {lang === 'hi' ? 'डेटा श्रेय एवं आभार' : 'Source Credits'}
        </h3>
        <p>
          Map data ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="text-teal underline"
          >
            OpenStreetMap contributors
          </a>
          . Timetable and bus telemetry data provided through the Delhi Transport Stack Hackathon 2026.
        </p>
      </section>
    </div>
  );
}
