import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * RouteCrowdingChart
 * Recreates the chart from Screenshot 2:
 * - Title: "Typical crowd on route [Route] by time of day"
 * - Subtitle: "Based on past ticket data. Weekday and weekend."
 * - Three background horizontal bands: High (pink), Moderate (yellow), Low (green)
 * - Y-axis labels: High, Moderate, Low
 * - X-axis: 6 am, 9 am, 12 pm, 3 pm, 6 pm, 9 pm
 * - Blue solid weekday curve, Dotted weekend curve
 * - Selected bus line with tag: "Your bus 6:00 pm"
 * - Smart suggestion card: "Leave 30 minutes later..."
 */
export default function RouteCrowdingChart({
  routeNumber = '73UP',
  profileData = null,
  weekendProfileData = null,
  departureTime = '18:00',
  className = '',
}) {
  const { lang } = useTranslation();

  // Selected departure time label e.g. "6:00 pm"
  const depTimeLabel = useMemo(() => {
    if (!departureTime) return '6:00 pm';
    const parts = departureTime.split(':');
    let h = parseInt(parts[0], 10) || 18;
    const m = parts[1] || '00';
    const period = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
  }, [departureTime]);

  const chartData = [
    { hour: '6 am', hourNum: 6, weekday: 28, weekend: 18 },
    { hour: '7 am', hourNum: 7, weekday: 58, weekend: 32 },
    { hour: '8 am', hourNum: 8, weekday: 82, weekend: 46 },
    { hour: '9 am', hourNum: 9, weekday: 91, weekend: 52 },
    { hour: '10 am', hourNum: 10, weekday: 78, weekend: 50 },
    { hour: '11 am', hourNum: 11, weekday: 60, weekend: 44 },
    { hour: '12 pm', hourNum: 12, weekday: 48, weekend: 40 },
    { hour: '1 pm', hourNum: 13, weekday: 44, weekend: 38 },
    { hour: '2 pm', hourNum: 14, weekday: 46, weekend: 40 },
    { hour: '3 pm', hourNum: 15, weekday: 54, weekend: 44 },
    { hour: '4 pm', hourNum: 16, weekday: 68, weekend: 48 },
    { hour: '5 pm', hourNum: 17, weekday: 86, weekend: 54 },
    { hour: '6 pm', hourNum: 18, weekday: 94, weekend: 58 },
    { hour: '7 pm', hourNum: 19, weekday: 85, weekend: 50 },
    { hour: '8 pm', hourNum: 20, weekday: 66, weekend: 38 },
    { hour: '9 pm', hourNum: 21, weekday: 42, weekend: 24 },
  ];

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 ${className}`}>
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          {lang === 'hi'
            ? `रूट ${routeNumber} पर दिन के समय अनुसार औसत भीड़`
            : `Typical crowd on route ${routeNumber} by time of day`}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {lang === 'hi'
            ? 'पिछले टिकट डेटा पर आधारित। कार्यदिवस और सप्ताहांत।'
            : 'Based on past ticket data. Weekday and weekend.'}
        </p>
      </div>

      {/* Chart with 3 colored background bands */}
      <div className="h-48 w-full relative pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
            {/* 3 Horizontal Bands: High (pink), Moderate (yellow), Low (green) */}
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
              tickFormatter={(val) => (val >= 70 ? 'High' : val >= 35 ? 'Moderate' : 'Low')}
              tick={{ fontSize: 9, fill: '#64748B' }}
            />

            {/* Vertical Reference Line for Selected Departure Time with Pin Tag */}
            <ReferenceLine
              x="6 pm"
              stroke="#1D4ED8"
              strokeDasharray="3 3"
              label={{
                value: `Your bus ${depTimeLabel}`,
                position: 'top',
                fill: '#1E3A8A',
                fontSize: 10,
                fontWeight: '600',
              }}
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

            {/* Solid Blue Line for Weekday */}
            <Area
              name="Weekday"
              type="monotone"
              dataKey="weekday"
              stroke="#1D4ED8"
              strokeWidth={2}
              fill="none"
              dot={false}
              activeDot={{ r: 4 }}
            />

            {/* Dotted Line for Weekend */}
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

      {/* Legend below chart */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 bg-blue-600 inline-block" />
          <span>Weekday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0.5 border-t border-dashed border-slate-400 inline-block" />
          <span>Weekend</span>
        </div>
      </div>

      {/* Smart Departure Recommendation Callout Box matching Screenshot 2 */}
      <div className="bg-blue-50/80 border border-blue-200/70 rounded-md p-3 text-xs text-blue-950 space-y-0.5">
        <h4 className="font-bold text-blue-900 text-xs">
          {lang === 'hi' ? '30 मिनट बाद प्रस्थान करें' : 'Leave 30 minutes later'}
        </h4>
        <p className="text-[11px] text-blue-800/90 leading-relaxed">
          {lang === 'hi'
            ? 'शाम 6:30 बजे भीड़ बहुत अधिक से मध्यम स्तर पर आ जाती है। यात्रा में केवल 4 मिनट अधिक समय लगता है।'
            : 'At 6:30 pm the crowd drops from very crowded to fairly crowded. The trip takes 4 min longer.'}
        </p>
      </div>
    </div>
  );
}
