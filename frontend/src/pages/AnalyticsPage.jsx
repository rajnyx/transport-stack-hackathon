import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getAnalyticsSummary, getDailyVolume } from '../api';
import RouteBadge from '../components/primitives/RouteBadge';
import CrowdStrip, { normalizeCrowdCategory } from '../components/primitives/CrowdStrip';
import { useTranslation } from '../i18n/LanguageContext';

export default function AnalyticsPage() {
  const { t, lang } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [dailyVolume, setDailyVolume] = useState([]);
  const [sortField, setSortField] = useState('avg_peak_rci');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    document.title = lang === 'hi' ? 'दिल्ली बस नेटवर्क विश्लेषण | CrowdWise' : 'Network Analytics | CrowdWise Delhi';
  }, [lang]);

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary().catch(() => ({ data: null })),
      getDailyVolume().catch(() => ({ data: [] })),
    ]).then(([sumRes, volRes]) => {
      if (sumRes?.data) setSummary(sumRes.data);
      if (volRes?.data && volRes.data.length > 0) {
        setDailyVolume(volRes.data);
      }
    });
  }, []);

  // 24-hour network diurnal demand curves
  const diurnalData = [
    { hour: '05:00', weekday: 12.0, weekend: 7.2 },
    { hour: '06:00', weekday: 28.5, weekend: 16.0 },
    { hour: '07:00', weekday: 58.2, weekend: 32.5 },
    { hour: '08:00', weekday: 82.4, weekend: 48.0 },
    { hour: '09:00', weekday: 88.2, weekend: 55.4 },
    { hour: '10:00', weekday: 80.5, weekend: 56.0 },
    { hour: '11:00', weekday: 62.0, weekend: 48.0 },
    { hour: '12:00', weekday: 48.5, weekend: 43.0 },
    { hour: '13:00', weekday: 44.0, weekend: 41.0 },
    { hour: '14:00', weekday: 46.5, weekend: 42.5 },
    { hour: '15:00', weekday: 54.0, weekend: 45.0 },
    { hour: '16:00', weekday: 68.2, weekend: 50.0 },
    { hour: '17:00', weekday: 85.0, weekend: 58.0 },
    { hour: '18:00', weekday: 93.0, weekend: 61.2 },
    { hour: '19:00', weekday: 88.4, weekend: 55.0 },
    { hour: '20:00', weekday: 71.5, weekend: 42.0 },
    { hour: '21:00', weekday: 50.0, weekend: 30.0 },
    { hour: '22:00', weekday: 32.0, weekend: 18.5 },
  ];

  // Top routes data
  const baseRoutes = summary?.top_crowded_routes || [
    { route_id: '717AUP', route_name: '717A Express Trunk', avg_rci: 82.5, avg_peak_rci: 94.2, peak_hour: '08:30 & 18:00', category: 'high' },
    { route_id: '717ADOWN', route_name: '717A Inbound Trunk', avg_rci: 80.8, avg_peak_rci: 92.0, peak_hour: '09:00 & 18:30', category: 'high' },
    { route_id: '729DOWN', route_name: '729 Kapashera–Old Delhi', avg_rci: 68.4, avg_peak_rci: 79.0, peak_hour: '09:00 & 18:30', category: 'moderate' },
    { route_id: '729UP', route_name: '729 Old Delhi–Kapashera', avg_rci: 64.0, avg_peak_rci: 74.5, peak_hour: '08:00 & 19:00', category: 'moderate' },
    { route_id: '511AUP', route_name: '511A Badarpur–Dhaula Kuan', avg_rci: 59.8, avg_peak_rci: 71.2, peak_hour: '09:30 & 18:00', category: 'moderate' },
    { route_id: '101UP', route_name: '101 Shivaji Stadium–Sarai Kale Khan', avg_rci: 46.5, avg_peak_rci: 58.0, peak_hour: '09:00 & 17:30', category: 'low' },
  ];

  const sortedRoutes = useMemo(() => {
    return [...baseRoutes].sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [baseRoutes, sortField, sortAsc]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="py-4 space-y-6 max-w-6xl mx-auto">
      {/* Title & Scope */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-navy">
          {lang === 'hi' ? 'दिल्ली बस नेटवर्क विश्लेषण' : 'Delhi Transit Network Analytics'}
        </h1>
        <p className="text-xs text-transit-textMuted mt-1">
          {lang === 'hi'
            ? 'अक्टूबर 2026 के 25.6 लाख आधिकारिक इलेक्ट्रॉनिक टिकटिंग रिकॉर्ड्स पर आधारित डेटा विश्लेषण।'
            : 'System-wide crowding analysis derived from 2.56M official October 2026 ETM ticket records.'}
        </p>
      </div>

      {/* 4-Figure Single Summary Strip divided by hairlines */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-transit-borderSubtle">
          <div className="p-3.5 sm:p-4 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-transit-textMuted uppercase tracking-wider block">
              {lang === 'hi' ? 'रूट शामिल' : 'Routes covered'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-navy tabular-nums mt-0.5 block">
              {summary?.total_routes ? summary.total_routes.toLocaleString() : '2,574'}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-transit-textMuted uppercase tracking-wider block">
              {lang === 'hi' ? 'टिकट रिकॉर्ड' : 'Tickets processed'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-navy tabular-nums mt-0.5 block">
              2.56M
            </span>
          </div>

          <div className="p-3.5 sm:p-4 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-transit-textMuted uppercase tracking-wider block">
              {lang === 'hi' ? 'दिनांक सीमा' : 'Date range'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-navy tabular-nums mt-0.5 block">
              01–31 Oct 2026
            </span>
          </div>

          <div className="p-3.5 sm:p-4 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-transit-textMuted uppercase tracking-wider block">
              {lang === 'hi' ? 'मॉडल अपडेट' : 'Last model update'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-teal tabular-nums mt-0.5 block">
              Oct 2026
            </span>
          </div>
        </div>
      </div>

      {/* Question 1: When is the network busiest? */}
      <section className="bg-white border border-border rounded-2xl shadow-sm p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-navy">
            {lang === 'hi' ? 'नेटवर्क सबसे अधिक व्यस्त कब होता है?' : 'When is the network busiest?'}
          </h2>
          <p className="text-xs text-transit-textMuted mt-0.5">
            {lang === 'hi'
              ? 'कार्यदिवसों पर दो स्पष्ट शिखर होते हैं: सुबह 9:00 बजे और शाम 6:00 बजे। सप्ताहांत में मांग लगभग 35% कम हो जाती है।'
              : 'Weekdays experience twin peak windows at 9:00 am and 6:00 pm. Weekend passenger load is approximately 35% lower.'}
          </p>
        </div>

        {/* Diurnal Chart (Navy / Teal / Grey) */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={diurnalData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#DDE2E3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#5F6B73' }} interval={2} />
              <YAxis
                tick={{ fontSize: 10, fill: '#5F6B73' }}
                label={{
                  value: lang === 'hi' ? 'भीड़ सूचकांक' : 'Crowd Index (0-100)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 25,
                  style: { fontSize: 10, fill: '#5F6B73' },
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-transit-border p-2.5 rounded-[4px] shadow-sm text-xs space-y-1">
                        <p className="font-bold text-navy">{d.hour}</p>
                        <p className="text-navy font-semibold">
                          {lang === 'hi' ? 'कार्यदिवस:' : 'Weekday load:'} {d.weekday} / 100
                        </p>
                        <p className="text-transit-textMuted font-medium">
                          {lang === 'hi' ? 'सप्ताहांत:' : 'Weekend load:'} {d.weekend} / 100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />
              <Area
                name={lang === 'hi' ? 'कार्यदिवस (Weekday)' : 'Weekday'}
                type="monotone"
                dataKey="weekday"
                stroke="#142B3B"
                strokeWidth={2}
                fill="#142B3B"
                fillOpacity={0.08}
              />
              <Area
                name={lang === 'hi' ? 'सप्ताहांत (Weekend)' : 'Weekend'}
                type="monotone"
                dataKey="weekend"
                stroke="#147D78"
                strokeWidth={2}
                fill="#147D78"
                fillOpacity={0.05}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Question 2: Which routes are most crowded at peak? */}
      <section className="bg-white border border-border rounded-2xl shadow-sm p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-navy">
            {lang === 'hi' ? 'पीक समय में कौन से रूट सबसे अधिक भरे होते हैं?' : 'Which routes are most crowded at peak?'}
          </h2>
          <p className="text-xs text-transit-textMuted mt-0.5">
            {lang === 'hi'
              ? 'ट्रंक रूट जैसे 717A और 729 पीक समय में 90% से अधिक क्षमता तक पहुंचते हैं।'
              : 'Trunk radial corridors (such as 717A and 729) reach over 90% load during morning and evening rush hours.'}
          </p>
        </div>

        {/* Sortable Table with Inline Bars */}
        <div className="overflow-x-auto border border-transit-border rounded-[4px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-transit-bg border-b border-transit-border text-navy">
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'रूट' : 'Route'}</th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'कॉरिडोर नाम' : 'Corridor Name'}</th>
                <th
                  onClick={() => toggleSort('avg_peak_rci')}
                  className="py-2.5 px-3 font-semibold cursor-pointer hover:text-teal select-none"
                >
                  {lang === 'hi' ? 'पीक भीड़ स्तर' : 'Peak Crowd Level'} {sortField === 'avg_peak_rci' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'पीक घंटे' : 'Peak Hours'}</th>
                <th className="py-2.5 px-3 font-semibold">{lang === 'hi' ? 'श्रेणी' : 'Category'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transit-borderSubtle">
              {sortedRoutes.map((r) => {
                const barWidth = Math.min(100, Math.round(r.avg_peak_rci));
                const normCat = normalizeCrowdCategory(r.category);
                const barColor =
                  normCat === 'high'
                    ? 'bg-crowd-high'
                    : normCat === 'moderate'
                    ? 'bg-crowd-mod'
                    : normCat === 'low'
                    ? 'bg-crowd-low'
                    : 'bg-crowd-unknown';

                return (
                  <tr key={r.route_id} className="hover:bg-transit-bg/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <RouteBadge routeNumber={r.route_id} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-medium text-navy">{r.route_name}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-transit-bg rounded-full overflow-hidden">
                          <div
                            style={{ width: `${barWidth}%` }}
                            className={`h-full ${barColor}`}
                          />
                        </div>
                        <span className="tabular-nums font-semibold text-navy">{r.avg_peak_rci}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-transit-textMuted tabular-nums">{r.peak_hour}</td>
                    <td className="py-2.5 px-3">
                      <CrowdStrip category={r.category} size="sm" showLabel={true} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Question 3: How are crowd levels distributed? */}
      <section className="bg-white border border-border rounded-2xl shadow-sm p-4 sm:p-5 space-y-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-navy">
            {lang === 'hi' ? 'नेटवर्क में भीड़ का वितरण कैसा है?' : 'How are crowd levels distributed?'}
          </h2>
          <p className="text-xs text-transit-textMuted mt-0.5">
            {lang === 'hi'
              ? 'आधे से अधिक बस घंटों (54%) में सीटें उपलब्ध रहती हैं। अत्यधिक भीड़ केवल कुछ विशिष्ट पीक घंटों तक सीमित है।'
              : 'Over 54% of operating bus hours offer available seats. Severe crowding is concentrated in specific morning and evening commute windows.'}
          </p>
        </div>

        {/* Horizontal Stacked Bar */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-full flex rounded-[4px] overflow-hidden bg-transit-bg">
            <div style={{ width: '54%' }} className="bg-crowd-low" title="54% Not crowded" />
            <div style={{ width: '32%' }} className="bg-crowd-mod" title="32% Fairly crowded" />
            <div style={{ width: '14%' }} className="bg-crowd-high" title="14% Very crowded" />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-transit-textMuted pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-crowd-low" />
              <span className="font-semibold text-navy">54%</span>
              <span>{lang === 'hi' ? 'कम भीड़ (सीट उपलब्ध)' : 'Not crowded (seats available)'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-crowd-mod" />
              <span className="font-semibold text-navy">32%</span>
              <span>{lang === 'hi' ? 'मध्यम भीड़ (खड़े होने की जगह)' : 'Fairly crowded (standing room)'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[2px] bg-crowd-high" />
              <span className="font-semibold text-navy">14%</span>
              <span>{lang === 'hi' ? 'ज़्यादा भीड़ (खचाखच)' : 'Very crowded (dense peak)'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
