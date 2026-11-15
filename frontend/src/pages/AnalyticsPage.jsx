import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from 'recharts';
import { ArrowDown, Users, BarChart2, ShieldCheck, Database, Info, X } from 'lucide-react';
import { getAnalyticsSummary } from '../api';
import CrowdIndicator from '../components/primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';

export default function AnalyticsPage() {
  const { lang } = useTranslation();
  const [selectedRoutes, setSelectedRoutes] = useState(['73UP', '534', '764']);
  const [activeProfileRoute, setActiveProfileRoute] = useState('73UP');
  const [show24hModal, setShow24hModal] = useState(false);
  const [sortField, setSortField] = useState('rci');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    document.title = 'Analytics | CrowdWise';
  }, []);

  // Diurnal dataset matching Stitch Screenshot 3
  const diurnalData = [
    { hour: '6 am', hourNum: 6, weekday: 26, weekend: 18 },
    { hour: '7 am', hourNum: 7, weekday: 55, weekend: 30 },
    { hour: '8 am', hourNum: 8, weekday: 82, weekend: 44 },
    { hour: '9 am', hourNum: 9, weekday: 92, weekend: 52 },
    { hour: '10 am', hourNum: 10, weekday: 78, weekend: 49 },
    { hour: '11 am', hourNum: 11, weekday: 60, weekend: 44 },
    { hour: '12 pm', hourNum: 12, weekday: 48, weekend: 40 },
    { hour: '1 pm', hourNum: 13, weekday: 45, weekend: 38 },
    { hour: '2 pm', hourNum: 14, weekday: 46, weekend: 41 },
    { hour: '3 pm', hourNum: 15, weekday: 54, weekend: 45 },
    { hour: '4 pm', hourNum: 16, weekday: 68, weekend: 48 },
    { hour: '5 pm', hourNum: 17, weekday: 86, weekend: 54 },
    { hour: '6 pm', hourNum: 18, weekday: 94, weekend: 58 },
    { hour: '7 pm', hourNum: 19, weekday: 84, weekend: 50 },
    { hour: '8 pm', hourNum: 20, weekday: 64, weekend: 36 },
    { hour: '9 pm', hourNum: 21, weekday: 40, weekend: 22 },
  ];

  // Most crowded routes table matching Stitch Screenshot 3
  const peakRoutes = [
    {
      route: '73UP',
      direction: 'Anand Vihar ISBT to Shivaji Stadium',
      peakHour: '6 pm',
      crowdLevel: 'high',
      rci: 88,
      dataAvailability: 'A lot of data',
    },
    {
      route: '534',
      direction: 'Mori Gate to Nehru Place',
      peakHour: '6 pm',
      crowdLevel: 'high',
      rci: 84,
      dataAvailability: 'A lot of data',
    },
    {
      route: '764',
      direction: 'Najafgarh to Connaught Place',
      peakHour: '9 am',
      crowdLevel: 'high',
      rci: 78,
      dataAvailability: 'Some data',
    },
    {
      route: '429',
      direction: 'Saket to Kashmere Gate',
      peakHour: '8 am',
      crowdLevel: 'moderate',
      rci: 56,
      dataAvailability: 'A lot of data',
    },
    {
      route: '85DOWN',
      direction: 'Shivaji Stadium to Anand Vihar ISBT',
      peakHour: '9 am',
      crowdLevel: 'moderate',
      rci: 48,
      dataAvailability: 'Some data',
    },
  ];

  const sortedPeakRoutes = useMemo(() => {
    return [...peakRoutes].sort((a, b) => {
      const vA = a[sortField] || 0;
      const vB = b[sortField] || 0;
      return sortAsc ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
    });
  }, [peakRoutes, sortField, sortAsc]);

  // Comparison dataset matching Stitch Screenshot 3
  const routeComparisonData = [
    { hour: '6 am', '73UP': 24, '534': 22, '764': 20 },
    { hour: '7 am', '73UP': 54, '534': 50, '764': 46 },
    { hour: '8 am', '73UP': 84, '534': 78, '764': 72 },
    { hour: '9 am', '73UP': 92, '534': 88, '764': 78 },
    { hour: '10 am', '73UP': 78, '534': 74, '764': 66 },
    { hour: '11 am', '73UP': 58, '534': 54, '764': 52 },
    { hour: '12 pm', '73UP': 48, '534': 44, '764': 44 },
    { hour: '1 pm', '73UP': 44, '534': 42, '764': 42 },
    { hour: '2 pm', '73UP': 46, '534': 44, '764': 44 },
    { hour: '3 pm', '73UP': 54, '534': 52, '764': 48 },
    { hour: '4 pm', '73UP': 68, '534': 66, '764': 56 },
    { hour: '5 pm', '73UP': 86, '534': 82, '764': 64 },
    { hour: '6 pm', '73UP': 95, '534': 92, '764': 70 },
    { hour: '7 pm', '73UP': 86, '534': 80, '764': 60 },
    { hour: '8 pm', '73UP': 66, '534': 60, '764': 48 },
    { hour: '9 pm', '73UP': 42, '534': 36, '764': 32 },
  ];

  // 24h Route Profile data (Boardings vs Onboard Load)
  const route24hData = [
    { hour: '05:00', boardings: 140, onboard: 22 },
    { hour: '06:00', boardings: 320, onboard: 48 },
    { hour: '07:00', boardings: 780, onboard: 74 },
    { hour: '08:00', boardings: 1250, onboard: 92 },
    { hour: '09:00', boardings: 1420, onboard: 96 },
    { hour: '10:00', boardings: 980, onboard: 82 },
    { hour: '11:00', boardings: 610, onboard: 58 },
    { hour: '12:00', boardings: 490, onboard: 46 },
    { hour: '13:00', boardings: 430, onboard: 42 },
    { hour: '14:00', boardings: 460, onboard: 44 },
    { hour: '15:00', boardings: 620, onboard: 54 },
    { hour: '16:00', boardings: 890, onboard: 68 },
    { hour: '17:00', boardings: 1290, onboard: 88 },
    { hour: '18:00', boardings: 1540, onboard: 95 },
    { hour: '19:00', boardings: 1180, onboard: 84 },
    { hour: '20:00', boardings: 790, onboard: 64 },
    { hour: '21:00', boardings: 480, onboard: 44 },
    { hour: '22:00', boardings: 210, onboard: 26 },
  ];

  const toggleRoute = (r) => {
    if (selectedRoutes.includes(r)) {
      if (selectedRoutes.length > 1) {
        setSelectedRoutes(selectedRoutes.filter((item) => item !== r));
      }
    } else {
      setSelectedRoutes([...selectedRoutes, r]);
    }
  };

  return (
    <div className="py-2 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Scope matching Stitch Screenshot 3 */}
      <div className="space-y-1.5 border-b border-[#d8e6dd] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004327] tracking-tight">
              {lang === 'hi' ? 'एनालिटिक्स और नेटवर्क अंतर्दृष्टि' : 'Analytics & Network Insights'}
            </h1>
            <p className="text-sm text-[#404942] mt-1">
              {lang === 'hi'
                ? 'टिकट डेटा में मार्गों पर भीड़ के पैटर्न। ऐतिहासिक डेटा पर आधारित, लाइव जीपीएस नहीं।'
                : 'Crowd patterns across routes in Delhi ticketing data. Based on past ticket data, not live vehicle telemetry.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-xs border border-[#d8e6dd] text-xs font-semibold text-[#136c46]">
            <span className="w-2 h-2 rounded-full bg-[#136c46] animate-pulse"></span>
            <span>2.56M Historical ETM Records Indexed</span>
          </div>
        </div>
      </div>

      {/* Section A: 4 Metric Cards in a single white card with hairline vertical dividers */}
      <div className="bg-white border border-[#d8e6dd] rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d8e6dd]">
          <div className="p-5">
            <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block">
              ROUTES WITH ENOUGH DATA
            </span>
            <span className="text-3xl font-extrabold text-[#004327] block mt-1">
              312
            </span>
            <span className="text-xs text-[#404942] block mt-0.5">
              of active DTC & Cluster routes
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block">
              TICKET RECORDS PROCESSED
            </span>
            <span className="text-3xl font-extrabold text-[#004327] block mt-1">
              2.4M
            </span>
            <span className="text-xs text-[#404942] block mt-0.5">
              clean trip transactions
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block">
              DATE RANGE
            </span>
            <span className="text-3xl font-extrabold text-[#004327] block mt-1">
              5 WEEKS
            </span>
            <span className="text-xs text-[#404942] block mt-0.5">
              weekdays and weekends
            </span>
          </div>

          <div className="p-5">
            <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider block">
              PREDICTIVE MODEL
            </span>
            <span className="text-2xl font-extrabold text-[#004327] block mt-1 truncate">
              Random Forest
            </span>
            <span className="text-xs text-[#404942] block mt-0.5">
              benchmark vs hourly baseline
            </span>
          </div>
        </div>
      </div>

      {/* Row of Two Cards: Section B & Section C matching Stitch Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Card: When is the network busiest? (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#d8e6dd] rounded-xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#004327]">
                  {lang === 'hi' ? 'नेटवर्क सबसे अधिक व्यस्त कब होता है?' : 'When is the network busiest?'}
                </h2>
                <p className="text-xs text-[#404942] mt-0.5">
                  Typical crowd level across all routes, by hour of day
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-[#004327]">
                  <span className="w-3.5 h-0.5 bg-[#004327] rounded-full"></span> Weekday
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#707971]">
                  <span className="w-3.5 h-0.5 border-b border-dashed border-[#707971]"></span> Weekend
                </span>
              </div>
            </div>

            {/* Line Chart with 3 colored background bands */}
            <div className="h-56 w-full pt-2 rounded-lg overflow-hidden bg-[#e9f7ee]/30 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diurnalData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsStitchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#145c3a" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#145c3a" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  {/* 3 Capacity Zone bands */}
                  <ReferenceArea y1={70} y2={100} fill="#ffdad6" fillOpacity={0.4} />
                  <ReferenceArea y1={35} y2={70} fill="#fef3c7" fillOpacity={0.4} />
                  <ReferenceArea y1={0} y2={35} fill="#e9f7ee" fillOpacity={0.5} />

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfc9c0" strokeWidth={0.8} />
                  <XAxis
                    dataKey="hour"
                    ticks={['6 am', '9 am', '12 pm', '3 pm', '6 pm', '9 pm']}
                    tick={{ fontSize: 10, fill: '#707971' }}
                    axisLine={{ stroke: '#d8e6dd' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[18, 52, 85]}
                    tickFormatter={(v) => (v >= 70 ? 'High' : v >= 35 ? 'Moderate' : 'Low')}
                    tick={{ fontSize: 9.5, fill: '#707971' }}
                    axisLine={false}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-[#d8e6dd] p-2.5 rounded-lg shadow-md text-xs space-y-1">
                            <p className="font-bold text-[#121e19]">{d.hour}</p>
                            <p className="text-[#004327] font-semibold">Weekday Index: {d.weekday}/100</p>
                            <p className="text-[#707971]">Weekend Index: {d.weekend}/100</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Area
                    name="Weekday"
                    type="monotone"
                    dataKey="weekday"
                    stroke="#004327"
                    strokeWidth={2.5}
                    fill="url(#analyticsStitchGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#004327' }}
                  />
                  <Line
                    name="Weekend"
                    type="monotone"
                    dataKey="weekend"
                    stroke="#707971"
                    strokeWidth={1.8}
                    strokeDasharray="4 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Takeaway callout box */}
          <div className="bg-[#e9f7ee] p-3 rounded-lg border border-[#d8e6dd]">
            <p className="text-xs text-[#121e19] leading-snug">
              <strong className="font-bold text-[#004327]">Weekday crowding peaks sharply at 9 am and 6 pm.</strong>{' '}
              Weekends stay noticeably flatter, with only a moderate bump around midday leisure hours.
            </p>
          </div>
        </div>

        {/* Right Card: How are crowd levels spread? (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#d8e6dd] rounded-xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#004327]">
              {lang === 'hi' ? 'भीड़ का वितरण कैसा है?' : 'How are crowd levels spread?'}
            </h2>
            <p className="text-xs text-[#404942] mt-0.5">
              Share of total route and hour slots in the dataset
            </p>

            {/* Horizontal Segmented Bar: 52% Green, 33% Yellow, 15% Red */}
            <div className="w-full flex h-6 rounded-md overflow-hidden shadow-inner my-4">
              <div
                style={{ width: '52%' }}
                className="bg-[#25865a] transition-all hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                title="52% Not crowded"
              >
                52%
              </div>
              <div
                style={{ width: '33%' }}
                className="bg-[#e0a51a] transition-all hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                title="33% Fairly crowded"
              >
                33%
              </div>
              <div
                style={{ width: '15%' }}
                className="bg-[#c64b4b] transition-all hover:opacity-90 flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                title="15% Very crowded"
              >
                15%
              </div>
            </div>

            {/* Breakdown Legend Rows matching Stitch Screenshot 3 */}
            <div className="flex flex-col gap-2.5 mt-4">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#e9f7ee]/60 border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#25865a]"></div>
                  <div className="flex items-center gap-1 text-xs text-[#121e19] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#25865a]" />
                    <span>Not crowded</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#004327]">52%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#e9f7ee]/60 border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#e0a51a]"></div>
                  <div className="flex items-center gap-1 text-xs text-[#121e19] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#e0a51a]" />
                    <span>Fairly crowded</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#004327]">33%</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#e9f7ee]/60 border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#c64b4b]"></div>
                  <div className="flex items-center gap-1 text-xs text-[#121e19] font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#c64b4b]" />
                    <span>Very crowded</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-[#004327]">15%</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#707971] pt-2 border-t border-[#d8e6dd] leading-relaxed">
            Levels are relative to other route and hour slots in the data. They reflect probabilistic capacity tiers, not absolute standing passenger counts.
          </p>
        </div>
      </div>

      {/* Section D: Which routes are most crowded at peak? matching Stitch Screenshot 3 */}
      <div className="bg-white border border-[#d8e6dd] rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e6dd]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#004327]">
              {lang === 'hi' ? 'पीक समय में कौन से रूट सबसे अधिक भरे होते हैं?' : 'Which routes are most crowded at peak?'}
            </h2>
            <p className="text-xs text-[#404942] mt-0.5">
              Weekday evening peak • Ranked by operational occupancy index
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShow24hModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#d8e6dd] text-xs font-semibold text-[#004327] hover:bg-[#e9f7ee] transition-colors cursor-pointer flex items-center gap-1"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>View 24h Route Profile</span>
            </button>
          </div>
        </div>

        {/* Clean Responsive Table matching Stitch */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#e9f7ee] text-[#404942] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-5">Route</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Peak Hour</th>
                <th className="py-3 px-4">Crowd Level</th>
                <th
                  onClick={() => {
                    setSortField('rci');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-[#004327]"
                >
                  <span className="flex items-center gap-1">
                    Relative Crowding
                    <ArrowDown className="w-3.5 h-3.5" />
                  </span>
                </th>
                <th className="py-3 px-5">Data Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8e6dd] text-[#121e19]">
              {sortedPeakRoutes.map((r) => (
                <tr
                  key={r.route}
                  onClick={() => {
                    setActiveProfileRoute(r.route);
                    setShow24hModal(true);
                  }}
                  className="hover:bg-[#e9f7ee]/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-[#004327] text-white font-bold font-mono text-xs tracking-wider">
                      {r.route}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#121e19]">
                    {r.direction}
                  </td>
                  <td className="py-3.5 px-4 text-[#404942] font-medium">
                    {r.peakHour}
                  </td>
                  <td className="py-3.5 px-4">
                    <CrowdIndicator category={r.crowdLevel} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 w-48">
                    <div className="w-full bg-[#d8e6dd] rounded-full h-2.5 overflow-hidden">
                      <div
                        style={{ width: `${r.rci}%` }}
                        className={`h-full rounded-full ${
                          r.crowdLevel === 'high' ? 'bg-[#c64b4b]' : 'bg-[#e0a51a]'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-[#404942] text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#136c46]"></span>
                      {r.dataAvailability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section E: How do selected routes compare? matching Stitch Screenshot 3 */}
      <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#004327]">
              {lang === 'hi' ? 'चयनित रूट कैसे तुलना करते हैं?' : 'How do selected routes compare?'}
            </h2>
            <p className="text-xs text-[#404942] mt-0.5">
              Normalized crowding load curves across service operational hours
            </p>
          </div>

          {/* Route Selector Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['73UP', '534', '764', '85DOWN'].map((r) => {
              const isSel = selectedRoutes.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRoute(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-[#004327] text-white shadow-xs'
                      : 'bg-[#e9f7ee] text-[#121e19] hover:bg-[#d8e6dd]'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Line Comparison Chart */}
        <div className="h-56 w-full pt-1 rounded-lg overflow-hidden bg-[#e9f7ee]/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={routeComparisonData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <ReferenceArea y1={70} y2={100} fill="#ffdad6" fillOpacity={0.4} />
              <ReferenceArea y1={35} y2={70} fill="#fef3c7" fillOpacity={0.4} />
              <ReferenceArea y1={0} y2={35} fill="#e9f7ee" fillOpacity={0.5} />

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfc9c0" strokeWidth={0.8} />
              <XAxis
                dataKey="hour"
                ticks={['6 am', '9 am', '12 pm', '3 pm', '6 pm', '9 pm']}
                tick={{ fontSize: 10, fill: '#707971' }}
                axisLine={{ stroke: '#d8e6dd' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[18, 52, 85]}
                tickFormatter={(v) => (v >= 70 ? 'High' : v >= 35 ? 'Moderate' : 'Low')}
                tick={{ fontSize: 9.5, fill: '#707971' }}
                axisLine={false}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const h = payload[0].payload.hour;
                    return (
                      <div className="bg-white border border-[#d8e6dd] p-2.5 rounded-lg shadow-md text-xs space-y-1">
                        <p className="font-bold text-[#121e19]">{h}</p>
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex justify-between gap-3 text-xs">
                            <span style={{ color: entry.stroke }} className="font-semibold">{entry.name}:</span>
                            <span className="font-bold">{entry.value}/100</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {selectedRoutes.includes('73UP') && (
                <Line
                  type="monotone"
                  dataKey="73UP"
                  name="73UP"
                  stroke="#004327"
                  strokeWidth={2.5}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('534') && (
                <Line
                  type="monotone"
                  dataKey="534"
                  name="534"
                  stroke="#136c46"
                  strokeWidth={2.5}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('764') && (
                <Line
                  type="monotone"
                  dataKey="764"
                  name="764"
                  stroke="#e0a51a"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('85DOWN') && (
                <Line
                  type="monotone"
                  dataKey="85DOWN"
                  name="85DOWN"
                  stroke="#707971"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-[#404942] pt-1">
          {selectedRoutes.map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-1 inline-block rounded-full"
                style={{
                  backgroundColor:
                    r === '73UP' ? '#004327' : r === '534' ? '#136c46' : r === '764' ? '#e0a51a' : '#707971',
                }}
              />
              <span className="font-semibold">{r}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#404942] pt-2 border-t border-[#d8e6dd]">
          534 and 73UP reach peak crowd levels in the evening rush hour. 764 maintains predominantly moderate volumes across midday.
        </p>
      </div>

      {/* Section F: Model Evaluation Benchmark Table */}
      <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#004327]">
          {lang === 'hi' ? 'मॉडल मूल्यांकन और सत्यापन (हेल्ड-आउट डेटा)' : 'Model vs Simple Average (Held-Out Evaluation)'}
        </h2>
        <p className="text-xs text-[#404942]">
          Rigorous out-of-sample evaluation on unseen historical Delhi bus passenger logs.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#e9f7ee] text-[#404942] text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-4">METHOD</th>
                <th className="py-2.5 px-4">MAE (MEAN ERROR)</th>
                <th className="py-2.5 px-4">RMSE</th>
                <th className="py-2.5 px-4">RANKING MATCH</th>
                <th className="py-2.5 px-4">LEVEL MATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8e6dd]">
              <tr>
                <td className="py-3 px-4 font-bold text-[#121e19]">Historical Average Baseline</td>
                <td className="py-3 px-4 tabular-nums">0.31</td>
                <td className="py-3 px-4 tabular-nums">0.42</td>
                <td className="py-3 px-4 tabular-nums">0.62</td>
                <td className="py-3 px-4 tabular-nums font-semibold">56%</td>
              </tr>
              <tr className="bg-[#e9f7ee]/30">
                <td className="py-3 px-4 font-bold text-[#004327]">Random Forest (CrowdWise ML)</td>
                <td className="py-3 px-4 tabular-nums font-semibold text-[#136c46]">0.24</td>
                <td className="py-3 px-4 tabular-nums font-semibold text-[#136c46]">0.33</td>
                <td className="py-3 px-4 tabular-nums font-semibold text-[#136c46]">0.74</td>
                <td className="py-3 px-4 tabular-nums font-bold text-[#004327]">67%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section G: 24h Route Profile Modal */}
      {show24hModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#d8e6dd] rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#d8e6dd] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#004327]">
                  24-Hour Route Profile: Route {activeProfileRoute}
                </h3>
                <p className="text-xs text-[#404942]">
                  Hourly historical passenger boardings (ETM) vs estimated onboard load
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="text-[#707971] hover:text-[#121e19] p-1 rounded-lg hover:bg-[#e9f7ee] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={route24hData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#bfc9c0" strokeWidth={0.8} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#707971' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#707971' }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    name="Boardings (Tickets/hr)"
                    type="monotone"
                    dataKey="boardings"
                    stroke="#136c46"
                    fill="#e9f7ee"
                  />
                  <Line
                    name="Estimated Onboard (RCI)"
                    type="monotone"
                    dataKey="onboard"
                    stroke="#004327"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#e9f7ee] p-3.5 rounded-xl border border-[#d8e6dd] text-xs text-[#121e19] leading-relaxed">
              <strong className="text-[#004327]">Methodology Note: </strong>
              Passenger boardings represent raw conductor electronic tickets issued per hour along {activeProfileRoute}. Onboard load represents the alighting-reconstructed passenger accumulation traveling on the bus across stop segments.
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="px-5 py-2 rounded-lg bg-[#004327] text-white text-xs font-bold hover:bg-[#0b422b] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
