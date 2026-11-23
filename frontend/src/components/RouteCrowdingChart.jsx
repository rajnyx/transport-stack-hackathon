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
import { useTranslation } from '../i18n/LanguageContext';

/**
 * RouteCrowdingChart — Matches Google Stitch Journey Results Chart:
 * - Title: "Typical crowd on route [Route] by time of day"
 * - Subtitle: "Based on past ticket data. Weekday vs weekend comparison."
 * - Three background horizontal capacity zones: High (red tint), Moderate (amber tint), Low (green tint)
 * - Y-axis labels: High, Moderate, Low (with margin so Moderate never clips)
 * - X-axis: 6 am, 9 am, 12 pm, 3 pm, 6 pm, 9 pm
 * - Deep green solid weekday curve with gradient fill (#004327), Dotted weekend curve (#707971)
 * - Selected bus line with tag: "Your bus: 6:00 pm"
 * - Dynamic 24h curve varying accurately per selected route based on real RCI & ML profile
 */
export default function RouteCrowdingChart({
  routeNumber = '73UP',
  option = null,
  selectedOption = null,
  profileData = null,
  weekendProfileData = null,
  departureTime = '18:00',
  className = '',
}) {
  const { lang } = useTranslation();

  const currentOption = selectedOption || option;
  const currentRouteNumber =
    routeNumber ||
    currentOption?.route_short_name ||
    currentOption?.route_id ||
    '73UP';

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

  // Compute dynamic chart data strictly varying per route
  const chartData = useMemo(() => {
    const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    const currentOpt = selectedOption || option;

    // 1. Determine target peak RCI scale for this specific route
    const optPeak = currentOpt?.peak_rci ?? currentOpt?.crowding?.peak_rci;
    const optRci = currentOpt?.rci ?? currentOpt?.crowding?.journey_rci ?? currentOpt?.avg_rci;
    const optCategory = String(
      currentOpt?.crowding_category ||
      currentOpt?.crowd_category ||
      currentOpt?.crowding?.category ||
      ''
    ).toLowerCase();

    let peakRci = optPeak;
    if (typeof peakRci !== 'number' || isNaN(peakRci) || peakRci <= 0) {
      if (typeof optRci === 'number' && !isNaN(optRci) && optRci > 0) {
        if (optRci >= 70) peakRci = Math.min(96, Math.round(optRci * 1.12));
        else if (optRci >= 40) peakRci = Math.round(optRci * 1.15);
        else peakRci = Math.max(16, Math.round(optRci * 1.15));
      } else if (optCategory.includes('high') || optCategory.includes('very')) {
        peakRci = 88;
      } else if (optCategory.includes('mod') || optCategory.includes('fair') || optCategory.includes('stand')) {
        peakRci = 62;
      } else {
        peakRci = 32;
      }
    }
    // Floor target peak at 16 so the curve remains readable
    peakRci = Math.max(16, Math.min(96, peakRci));

    // Standard Delhi diurnal curve factors (AM rush 8-9, PM rush 17-18, midday valley)
    const diurnalFactors = {
      6: 0.35, 7: 0.62, 8: 0.90, 9: 0.98, 10: 0.82, 11: 0.62,
      12: 0.50, 13: 0.46, 14: 0.50, 15: 0.58, 16: 0.72, 17: 0.92,
      18: 1.00, 19: 0.86, 20: 0.66, 21: 0.42,
    };

    // Check if profileData matches the currently selected route
    const currentRouteId = currentOpt?.route_id;
    const currentRouteName = currentOpt?.route_short_name;
    const profileRouteId = profileData?.route_id;
    const isProfileMatching =
      !profileRouteId ||
      profileRouteId === currentRouteId ||
      profileRouteId === currentRouteName;

    const weekdayHourly = isProfileMatching ? (profileData?.hourly_profile || []) : [];
    const weekendHourly = isProfileMatching ? (weekendProfileData?.hourly_profile || []) : [];

    // If API returned real 24-hour profile data for this route
    if (weekdayHourly.length > 0) {
      const maxLoad = Math.max(...weekdayHourly.map((p) => p.rci || p.mean_load || p.load || 1), 1);
      const maxWkndLoad = weekendHourly.length > 0
        ? Math.max(...weekendHourly.map((p) => p.rci || p.mean_load || p.load || 1), 1)
        : maxLoad;

      return hours.map((h) => {
        const wp = weekdayHourly.find((p) => p.hour === h);
        const wkp = weekendHourly.find((p) => p.hour === h);

        const rawWk = wp ? (wp.rci || wp.mean_load || wp.load || 1) : null;
        const rawWknd = wkp ? (wkp.rci || wkp.mean_load || wkp.load || 1) : null;

        const wkRatio = rawWk !== null ? Math.max(0.2, rawWk / maxLoad) : (diurnalFactors[h] || 0.5);
        const wkndRatio = rawWknd !== null ? Math.max(0.18, rawWknd / maxWkndLoad) : wkRatio * 0.62;

        const weekday = Math.round(Math.max(5, Math.min(98, peakRci * wkRatio)));
        const weekend = Math.round(Math.max(4, Math.min(weekday * 0.85, peakRci * 0.62 * (wkndRatio / (wkRatio || 1)))));

        const period = h >= 12 ? 'pm' : 'am';
        const displayH = h % 12 || 12;

        return {
          hour: `${displayH} ${period}`,
          hourNum: h,
          weekday,
          weekend,
        };
      });
    }

    // Default model scaled directly to this route's peak
    return hours.map((h) => {
      const factor = diurnalFactors[h] || 0.5;
      const weekday = Math.round(Math.max(6, Math.min(98, peakRci * factor)));
      const weekend = Math.round(Math.max(4, Math.min(weekday * 0.8, peakRci * factor * 0.62)));

      const period = h >= 12 ? 'pm' : 'am';
      const displayH = h % 12 || 12;

      return {
        hour: `${displayH} ${period}`,
        hourNum: h,
        weekday,
        weekend,
      };
    });
  }, [profileData, weekendProfileData, option, selectedOption, routeNumber]);

  return (
    <div className={`bg-white border border-[#d8e6dd] rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5 ${className}`}>
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-[#121e19]">
          {lang === 'hi'
            ? `रूट ${currentRouteNumber} पर 24 घंटे का भीड़ प्रोफ़ाइल (RCI 0–100)`
            : `24-Hour Crowding Profile (RCI 0–100) — Route ${currentRouteNumber}`}
        </h3>
        <p className="text-[11px] text-[#404942] mt-0.5">
          {lang === 'hi'
            ? 'रिलेटिव क्राउडिंग इंडेक्स (RCI)। कार्यदिवस (Navy) बनाम सप्ताहांत (Teal)।'
            : 'Relative Crowding Index (RCI) across 24 hours. Weekday (Navy) vs Weekend (Teal).'}
        </p>
      </div>

      {/* Chart with 3 colored capacity zones matching Stitch design */}
      <div className="h-44 w-full relative pt-1 rounded-lg overflow-hidden bg-[#e9f7ee]/30 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 16, bottom: 0 }}>
            <defs>
              <linearGradient id="crowdStitchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#145c3a" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#145c3a" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* 3 Horizontal Bands: High (red), Moderate (amber), Low (green) */}
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
    </div>
  );
}
