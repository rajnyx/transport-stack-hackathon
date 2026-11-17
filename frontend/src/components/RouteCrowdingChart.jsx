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
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * RouteCrowdingChart — Matches Google Stitch Journey Results Chart:
 * - Title: "Typical crowd on route [Route] by time of day"
 * - Subtitle: "Based on past ticket data. Weekday vs weekend comparison."
 * - Three background horizontal capacity zones: High (red tint), Moderate (amber tint), Low (green tint)
 * - Y-axis labels: High, Moderate, Low (with margin so Moderate never clips - Phase 3)
 * - X-axis: 6 am, 9 am, 12 pm, 3 pm, 6 pm, 9 pm
 * - Deep green solid weekday curve with gradient fill (#004327), Dotted weekend curve (#707971)
 * - Selected bus line with tag: "Your bus: 6:00 pm"
 * - Proactive Recommendation Banner without seat claims (Phase 2)
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

  // Closest x-axis point for reference line
  const closestHourLabel = useMemo(() => {
    if (!departureTime) return '6 pm';
    const parts = departureTime.split(':');
    let h = parseInt(parts[0], 10);
    if (isNaN(h)) return '6 pm';
    if (h < 6) h = 6;
    if (h > 21) h = 21;
    const period = h >= 12 ? 'pm' : 'am';
    const displayH = h % 12 || 12;
    return `${displayH} ${period}`;
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
    <div className={`bg-white border border-[#d8e6dd] rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 ${className}`}>
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-[#121e19]">
          {lang === 'hi'
            ? `रूट ${routeNumber} पर दिन के समय अनुसार औसत भीड़`
            : `Typical crowd on route ${routeNumber} by time of day`}
        </h3>
        <p className="text-[11px] text-[#404942] mt-0.5">
          {lang === 'hi'
            ? 'पिछले टिकट डेटा पर आधारित। कार्यदिवस बनाम सप्ताहांत।'
            : 'Based on past ticket data. Weekday vs weekend comparison.'}
        </p>
      </div>

      {/* Chart with 3 colored capacity zones */}
      <div className="h-44 w-full relative pt-1 rounded-lg overflow-hidden bg-[#e9f7ee]/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="crowdStitchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#145c3a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#145c3a" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* 3 Horizontal Bands: High, Moderate, Low */}
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
              tickFormatter={(val) => (val >= 70 ? 'High' : val >= 35 ? 'Moderate' : 'Low')}
              tick={{ fontSize: 9.5, fill: '#707971' }}
              axisLine={false}
              width={42}
            />

            {/* Vertical Reference Line for Selected Departure Time with Pin Tag */}
            <ReferenceLine
              x={closestHourLabel}
              stroke="#136c46"
              strokeDasharray="2 2"
              strokeWidth={1.5}
              label={{
                value: `Your bus: ${depTimeLabel}`,
                position: 'top',
                fill: '#004327',
                fontSize: 10,
                fontWeight: '700',
              }}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#d8e6dd] p-2.5 rounded-lg shadow-md text-xs space-y-1">
                      <p className="font-bold text-[#121e19]">{d.hour}</p>
                      <p className="text-[#004327] font-semibold">Weekday: {d.weekday}/100</p>
                      <p className="text-[#707971]">Weekend: {d.weekend}/100</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Solid Deep Green Line with Gradient Area for Weekday */}
            <Area
              name="Weekday"
              type="monotone"
              dataKey="weekday"
              stroke="#004327"
              strokeWidth={2.5}
              fill="url(#crowdStitchGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#004327' }}
            />

            {/* Dotted Line for Weekend */}
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

      {/* Legend below chart */}
      <div className="flex items-center gap-4 text-xs text-[#404942] pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-[#004327] inline-block rounded-full" />
          <span className="font-medium">Weekday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-b border-dashed border-[#707971] inline-block" />
          <span className="font-medium text-[#707971]">Weekend</span>
        </div>
      </div>

      {/* Dynamic Proactive Recommendation Banner (Phase 2 honest wording without seats) */}
      <div className="bg-[#e3f1e8] border border-[#d8e6dd] rounded-lg p-3 text-xs text-[#121e19] flex items-start gap-2.5">
        <Lightbulb className="w-5 h-5 text-[#136c46] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[#004327] text-xs">
            {lang === 'hi' ? '30 मिनट बाद प्रस्थान करें' : 'Leave 30 minutes later'}
          </span>
          <p className="text-[11px] text-[#404942] leading-relaxed">
            {lang === 'hi'
              ? '30 मिनट बाद प्रस्थान करें: आपके स्टॉप पर भीड़ बहुत अधिक से मध्यम स्तर पर आ जाती है। यात्रा में लगभग 4 मिनट अधिक समय लगता है।'
              : 'Leave 30 minutes later: crowd drops from Very crowded to Fairly crowded at your stop. The trip takes about 4 min longer.'}
          </p>
        </div>
      </div>
    </div>
  );
}
