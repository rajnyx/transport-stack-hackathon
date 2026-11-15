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

  // Diurnal dataset matching Screenshot 3
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

  // Most crowded routes table matching Screenshot 3
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
      route: '850DOWN',
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

  // Comparison dataset matching Screenshot 3
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
    <div className="py-4 space-y-6 max-w-6xl mx-auto">
      {/* Title & Scope matching Screenshot 3 */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Crowd patterns across the routes in the ticket data. Based on past ticket data, not live conditions.
        </p>
        <div className="pt-1">
          <span className="inline-block text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
            Data: organizer ETM and e-ticketing records · sample data range · model updated with the latest data
          </span>
        </div>
      </div>

      {/* Section A: 4 Metric Cards in a single white card with hairline vertical dividers */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              ROUTES WITH ENOUGH DATA
            </span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              312
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              of the routes in the timetable
            </span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              TICKET RECORDS PROCESSED
            </span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              2.4 million
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              after cleaning
            </span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              DATE RANGE
            </span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              5 weeks
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              weekdays and weekends
            </span>
          </div>

          <div className="p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              MODEL
            </span>
            <span className="text-2xl font-bold text-slate-900 block mt-1">
              Random Forest
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              compared with a simple average
            </span>
          </div>
        </div>
      </div>

      {/* Row of Two Cards: Section B & Section C matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: When is the network busiest? (7 cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              When is the network busiest?
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Typical crowd level across all routes, by hour
            </p>

            {/* Line Chart with 3 colored background bands */}
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={diurnalData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <ReferenceArea y1={70} y2={100} fill="#FEE2E2" fillOpacity={0.65} />
                  <ReferenceArea y1={35} y2={70} fill="#FEF3C7" fillOpacity={0.65} />
                  <ReferenceArea y1={0} y2={35} fill="#DCFCE7" fillOpacity={0.65} />

                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="hour"
                    ticks={['6 am', '9 am', '12 pm', '3 pm', '6 pm', '9 pm']}
                    tick={{ fontSize: 9.5, fill: '#64748B' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[18, 52, 85]}
                    tickFormatter={(v) => (v >= 70 ? 'High' : v >= 35 ? 'Moderate' : 'Low')}
                    tick={{ fontSize: 9, fill: '#64748B' }}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 p-2 rounded shadow-sm text-xs space-y-0.5">
                            <p className="font-bold text-slate-900">{d.hour}</p>
                            <p className="text-blue-700 font-semibold">Weekday: {d.weekday}/100</p>
                            <p className="text-slate-500">Weekend: {d.weekend}/100</p>
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
                    stroke="#1D4ED8"
                    strokeWidth={2}
                    fill="none"
                    dot={false}
                  />
                  <Line
                    name="Weekend"
                    type="monotone"
                    dataKey="weekend"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 bg-blue-600 inline-block" />
                <span>Weekday</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-0.5 border-t border-dashed border-slate-400 inline-block" />
                <span>Weekend</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            Weekday crowding peaks around 9 am and 6 pm. Weekends stay flatter, with a small bump around midday.
          </p>
        </div>

        {/* Right Card: How are crowd levels spread? (5 cols) */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              How are crowd levels spread?
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Share of route and hour slots at each level
            </p>

            {/* Horizontal Segmented Bar: 52% Green, 33% Yellow, 15% Red */}
            <div className="h-4 w-full flex rounded-xs overflow-hidden mt-6 mb-4">
              <div style={{ width: '52%' }} className="bg-emerald-600" title="52% Not crowded" />
              <div style={{ width: '33%' }} className="bg-amber-500" title="33% Fairly crowded" />
              <div style={{ width: '15%' }} className="bg-red-600" title="15% Very crowded" />
            </div>

            {/* Legend list with person icons matching Screenshot 3 */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between">
                <CrowdIndicator category="low" size="sm" />
                <span className="font-bold text-slate-900 tabular-nums">52%</span>
              </div>
              <div className="flex items-center justify-between">
                <CrowdIndicator category="moderate" size="sm" />
                <span className="font-bold text-slate-900 tabular-nums">33%</span>
              </div>
              <div className="flex items-center justify-between">
                <CrowdIndicator category="high" size="sm" />
                <span className="font-bold text-slate-900 tabular-nums">15%</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Levels are relative to other route and hour slots in the data. They are not seat counts.
          </p>
        </div>
      </div>

      {/* Section D: Which routes are most crowded at peak? matching Screenshot 3 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Which routes are most crowded at peak?
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Weekday evening peak · sortable
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShow24hModal(true)}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            View 24h Route Profile →
          </button>
        </div>

        {/* Clean Table with hairline dividers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-2.5">ROUTE</th>
                <th className="py-2 px-2.5">DIRECTION</th>
                <th className="py-2 px-2.5">PEAK HOUR</th>
                <th className="py-2 px-2.5">CROWD LEVEL</th>
                <th
                  onClick={() => {
                    setSortField('rci');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2 px-2.5 cursor-pointer hover:text-slate-800"
                >
                  RELATIVE CROWDING {sortField === 'rci' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="py-2 px-2.5">DATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPeakRoutes.map((r) => (
                <tr
                  key={r.route}
                  onClick={() => {
                    setActiveProfileRoute(r.route);
                    setShow24hModal(true);
                  }}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-2.5">
                    <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                      {r.route}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 font-medium text-slate-800">
                    {r.direction}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600">
                    {r.peakHour}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <CrowdIndicator category={r.crowdLevel} size="sm" />
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${r.rci}%` }}
                        className={`h-full ${
                          r.crowdLevel === 'high' ? 'bg-red-600' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-500 text-[11px]">
                    {r.dataAvailability}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section E: How do selected routes compare? matching Screenshot 3 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              How do selected routes compare?
            </h2>
          </div>

          {/* Route Buttons [73UP] [534] [764] [+ Add route] */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['73UP', '534', '764', '850DOWN'].map((r) => {
              const isSel = selectedRoutes.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRoute(r)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                    isSel
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => toggleRoute('429')}
              className="px-2.5 py-1 rounded text-xs text-slate-500 border border-dashed border-slate-300 hover:border-slate-400"
            >
              + Add route
            </button>
          </div>
        </div>

        {/* Multi-Line Comparison Chart */}
        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={routeComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <ReferenceArea y1={70} y2={100} fill="#FEE2E2" fillOpacity={0.65} />
              <ReferenceArea y1={35} y2={70} fill="#FEF3C7" fillOpacity={0.65} />
              <ReferenceArea y1={0} y2={35} fill="#DCFCE7" fillOpacity={0.65} />

              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="hour"
                ticks={['6 am', '9 am', '12 pm', '3 pm', '6 pm', '9 pm']}
                tick={{ fontSize: 9.5, fill: '#64748B' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[18, 52, 85]}
                tickFormatter={(v) => (v >= 70 ? 'High' : v >= 35 ? 'Moderate' : 'Low')}
                tick={{ fontSize: 9, fill: '#64748B' }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const h = payload[0].payload.hour;
                    return (
                      <div className="bg-white border border-slate-200 p-2 rounded shadow-sm text-xs space-y-1">
                        <p className="font-bold text-slate-900">{h}</p>
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex justify-between gap-3 text-[11px]">
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
                  stroke="#1D4ED8"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('534') && (
                <Line
                  type="monotone"
                  dataKey="534"
                  name="534"
                  stroke="#0F172A"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('764') && (
                <Line
                  type="monotone"
                  dataKey="764"
                  name="764"
                  stroke="#64748B"
                  strokeWidth={2}
                  dot={false}
                />
              )}
              {selectedRoutes.includes('850DOWN') && (
                <Line
                  type="monotone"
                  dataKey="850DOWN"
                  name="850DOWN"
                  stroke="#0D9488"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend matching Screenshot 3 */}
        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
          {selectedRoutes.map((r) => (
            <div key={r} className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-0.5 inline-block"
                style={{
                  backgroundColor:
                    r === '73UP' ? '#1D4ED8' : r === '534' ? '#0F172A' : '#64748B',
                }}
              />
              <span>{r}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
          534 and 73UP reach the highest crowd levels in the evening. 764 stays mostly in the moderate band.
        </p>
      </div>

      {/* Section G: Model vs Simple Average (from prompt requirements) */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Model vs Simple Average (Held-Out Evaluation)
        </h2>
        <p className="text-[11px] text-slate-500">
          Comparison evaluated on unseen test data from the final week of October 2026.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2 px-2.5">METHOD</th>
                <th className="py-2 px-2.5">MAE (MEAN ERROR)</th>
                <th className="py-2 px-2.5">RMSE</th>
                <th className="py-2 px-2.5">RANKING MATCH</th>
                <th className="py-2 px-2.5">LEVEL MATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-2.5 font-bold text-slate-800">Simple average</td>
                <td className="py-2.5 px-2.5 tabular-nums">0.31</td>
                <td className="py-2.5 px-2.5 tabular-nums">0.42</td>
                <td className="py-2.5 px-2.5 tabular-nums">0.62</td>
                <td className="py-2.5 px-2.5 tabular-nums font-semibold">56%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-2.5 font-bold text-blue-900">Random Forest (ML)</td>
                <td className="py-2.5 px-2.5 tabular-nums font-semibold text-emerald-700">0.24</td>
                <td className="py-2.5 px-2.5 tabular-nums font-semibold text-emerald-700">0.33</td>
                <td className="py-2.5 px-2.5 tabular-nums font-semibold text-emerald-700">0.74</td>
                <td className="py-2.5 px-2.5 tabular-nums font-bold text-emerald-700">67%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section F: 24h Route Profile Modal */}
      {show24hModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-2xl w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  24-Hour Route Profile: Route {activeProfileRoute}
                </h3>
                <p className="text-xs text-slate-500">
                  Hourly historical passenger boardings (ETM) vs estimated onboard load
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={route24hData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    name="Boardings (Tickets/hr)"
                    type="monotone"
                    dataKey="boardings"
                    stroke="#0284C7"
                    fill="#E0F2FE"
                  />
                  <Line
                    name="Estimated Onboard (RCI)"
                    type="monotone"
                    dataKey="onboard"
                    stroke="#15803D"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 leading-relaxed">
              <strong>Distinction Note: </strong>
              Passenger boardings represent raw conductor tickets issued per hour at stops along {activeProfileRoute}. Onboard load represents the alighting-reconstructed passenger accumulation traveling on the bus at any given point.
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShow24hModal(false)}
                className="px-4 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold"
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
