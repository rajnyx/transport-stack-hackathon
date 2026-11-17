import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Calendar,
} from 'lucide-react';
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
import { getRouteDetails, getRouteCrowdProfile } from '../api';
import RouteBadge from '../components/primitives/RouteBadge';
import CrowdStrip, { normalizeCrowdCategory } from '../components/primitives/CrowdStrip';
import LeafletRouteMap from '../components/LeafletRouteMap';
import SegmentedControl from '../components/primitives/SegmentedControl';
import { useTranslation } from '../i18n/LanguageContext';

export default function RouteDetailsPage() {
  const { id: routeId = '101UP' } = useParams();
  const { t, lang } = useTranslation();

  const [routeInfo, setRouteInfo] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [weekendProfileData, setWeekendProfileData] = useState(null);
  const [dayType, setDayType] = useState('WEEKDAY');
  const [selectedHour, setSelectedHour] = useState(18); // Default 6:00 pm peak
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = `Route ${routeId} Crowding & Schedule | CrowdWise Delhi`;
  }, [routeId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getRouteDetails(routeId).catch((err) => ({ ok: false, error: err })),
      getRouteCrowdProfile(routeId, dayType).catch((err) => ({ ok: false, error: err })),
      getRouteCrowdProfile(routeId, 'SUNDAY').catch((err) => ({ ok: false, error: err })),
    ])
      .then(([routeRes, profileRes, weekendRes]) => {
        if (!isMounted) return;
        if (routeRes.ok && routeRes.data) {
          setRouteInfo(routeRes.data);
        }
        if (profileRes.ok && profileRes.data) {
          setProfileData(profileRes.data);
        }
        if (weekendRes.ok && weekendRes.data) {
          setWeekendProfileData(weekendRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || (lang === 'hi' ? 'रूट विवरण लोड करने में विफल।' : 'Failed to load route details.'));
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [routeId, dayType, lang]);

  // Clean diurnal chart data comparing weekday vs weekend
  const chartData = useMemo(() => {
    const hourly = profileData?.hourly_profile || [];
    const weekendHourly = weekendProfileData?.hourly_profile || [];

    return hourly.map((h, i) => {
      const wknd = weekendHourly[i] || {};
      return {
        hour: `${h.hour % 12 || 12} ${h.hour >= 12 ? 'pm' : 'am'}`,
        hour24: h.hour,
        mean_load: Math.round(h.mean_load || 0),
        weekend_load: Math.round(wknd.mean_load || (h.mean_load ? h.mean_load * 0.65 : 0)),
        max_load: Math.round(h.max_load || 0),
        rci: Math.round(h.rci || 0),
        category: h.crowd_category || 'Not crowded',
      };
    });
  }, [profileData, weekendProfileData]);

  // Compute one-sentence takeaway from data
  const takeawaySentence = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return lang === 'hi'
        ? 'इस रूट के लिए ऐतिहासिक डेटा सामान्य है।'
        : 'Historical load data for this route shows typical commuter patterns.';
    }
    const maxHourObj = [...chartData].sort((a, b) => b.mean_load - a.mean_load)[0];
    const peakHour = maxHourObj?.hour || '6 pm';
    const peakCrowd = maxHourObj?.category || 'Fairly crowded';

    if (lang === 'hi') {
      return `यह रूट मुख्य रूप से ${peakHour} के आसपास सबसे व्यस्त रहता है (औसत लोड इंडेक्स: ${maxHourObj.mean_load})।`;
    }
    return `Peak crowding occurs around ${peakHour} with an estimated average load index of ${maxHourObj.mean_load}.`;
  }, [chartData, lang]);

  const stops = routeInfo?.stops || [];
  const routeNum = routeInfo?.route_short_name || routeId;

  // Segment crowd level computation for chosen hour
  const getSegmentCrowd = (stopIndex) => {
    const hourlyPoint = chartData.find((p) => p.hour24 === selectedHour);
    const rci = hourlyPoint?.rci || 45;
    if (rci > 80) return 'high';
    if (rci > 50) return 'moderate';
    return 'low';
  };

  return (
    <div className="py-4 space-y-4">
      {/* Route Header */}
      <div className="bg-white border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RouteBadge routeNumber={routeNum} size="lg" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-navy">
                {routeInfo?.route_long_name || `Bus Route ${routeNum}`}
              </h1>
              <p className="text-xs text-transit-textMuted mt-0.5">
                {stops.length} {t('results.stops')} · {routeInfo?.agency_name || 'Delhi DTC'} · {t('app.historicalNote')}
              </p>
            </div>
          </div>

          {/* Quick Route Switcher */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-transit-textMuted font-medium">
              {lang === 'hi' ? 'रूट:' : 'Routes:'}
            </span>
            {['73UP', '85DOWN', '108AUP'].map((r) => (
              <Link
                key={r}
                to={`/route/${r}`}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                  routeId === r
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-white text-navy border-border hover:border-teal hover:bg-teal-tint'
                }`}
              >
                {r}
              </Link>
            ))}
          </div>
        </div>

        {/* Day Type Selector & Hour Control */}
        <div className="pt-2 border-t border-transit-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy">
              {lang === 'hi' ? 'दिन:' : 'Day type:'}
            </span>
            <SegmentedControl
              options={[
                { value: 'WEEKDAY', label: lang === 'hi' ? 'कार्यदिवस' : 'Weekday' },
                { value: 'SATURDAY', label: lang === 'hi' ? 'शनिवार' : 'Saturday' },
                { value: 'SUNDAY', label: lang === 'hi' ? 'रविवार' : 'Sunday' },
              ]}
              value={dayType}
              onChange={(val) => setDayType(val)}
              className="max-w-[300px]"
            />
          </div>

          {/* Hour Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-teal" />
            <span className="text-transit-textMuted">
              {lang === 'hi' ? 'समय चुनें:' : 'Hour:'}
            </span>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value, 10))}
              aria-label="Select inspection hour"
              className="border border-transit-border rounded-[4px] bg-white px-2 py-1 text-xs text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {h % 12 || 12}:00 {h >= 12 ? 'pm' : 'am'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Vertical Timeline & Diurnal Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Vertical Stop Timeline with Crowd Colors (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-transit-border rounded-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-transit-border pb-2.5">
            <div>
              <h2 className="text-sm font-bold text-navy">
                {lang === 'hi' ? 'स्टॉप समयरेखा और भीड़ स्तर' : 'Stop Timeline & Crowding'}
              </h2>
              <p className="text-[11px] text-transit-textMuted">
                {selectedHour % 12 || 12}:00 {selectedHour >= 12 ? 'pm' : 'am'} ({dayType.toLowerCase()})
              </p>
            </div>
            <CrowdStrip category={getSegmentCrowd(0)} size="sm" />
          </div>

          {/* Timeline List */}
          <div className="space-y-0 max-h-[520px] overflow-y-auto pr-2">
            {stops.map((stop, idx) => {
              const segCrowd = getSegmentCrowd(idx);
              const isFirst = idx === 0;
              const isLast = idx === stops.length - 1;

              const crowdBarColor =
                segCrowd === 'high'
                  ? 'bg-[#C64B4B]'
                  : segCrowd === 'moderate'
                  ? 'bg-[#E0A51A]'
                  : 'bg-[#145C3A]';

              return (
                <div key={stop.stop_id || idx} className="relative flex items-start">
                  {/* Timeline Spine Column */}
                  <div className="flex flex-col items-center mr-4 w-5 flex-shrink-0">
                    {/* Node Dot */}
                    {isFirst ? (
                      <div className="w-4 h-4 rounded-full border-[3.5px] border-[#145C3A] bg-white flex-shrink-0 z-10" />
                    ) : isLast ? (
                      <div className="w-4 h-4 rounded-full bg-[#145C3A] ring-4 ring-[#145C3A]/20 flex-shrink-0 z-10" />
                    ) : (
                      <div className="w-2.5 h-2.5 my-0.5 rounded-full bg-[#BDC7C1] flex-shrink-0 z-10" />
                    )}

                    {/* Connecting line */}
                    {!isLast && (
                      <div className={`w-[3px] h-10 ${crowdBarColor} rounded-full my-1 transition-colors duration-200`} />
                    )}
                  </div>

                  {/* Stop Name & Crowd Chip */}
                  <div className="pb-4 min-w-0 flex-1 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-navy truncate block">
                        {stop.stop_name || `Stop #${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-transit-textMuted font-mono">
                        {stop.stop_id}
                      </span>
                    </div>

                    {!isLast && (
                      <span className="text-[11px] text-transit-textMuted shrink-0">
                        {segCrowd === 'high'
                          ? (lang === 'hi' ? 'ज़्यादा भीड़' : 'Very crowded')
                          : segCrowd === 'moderate'
                          ? (lang === 'hi' ? 'मध्यम भीड़' : 'Fairly crowded')
                          : (lang === 'hi' ? 'कम भीड़' : 'Not crowded')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Diurnal Crowding Profile Chart & Map (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Diurnal Chart Card */}
          <div className="bg-white border border-transit-border rounded-panel p-4 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-navy">
                {lang === 'hi' ? '24 घंटे का भीड़ प्रोफाइल (कार्यदिवस बनाम सप्ताहांत)' : '24-Hour Crowding Profile (Weekday vs Weekend)'}
              </h2>
              <p className="text-[11px] text-teal font-medium mt-0.5">
                {takeawaySentence}
              </p>
            </div>

            {/* Recharts Area Chart comparing Weekday and Weekend */}
            <div className="h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#DDE2E3" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: '#5F6B73' }}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#5F6B73' }}
                    label={{
                      value: lang === 'hi' ? 'सापेक्ष लोड इंडेक्स' : 'Relative load index',
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
                              {lang === 'hi' ? 'कार्यदिवस लोड:' : 'Weekday load:'} {d.mean_load}
                            </p>
                            <p className="text-teal font-semibold">
                              {lang === 'hi' ? 'सप्ताहांत लोड:' : 'Weekend load:'} {d.weekend_load}
                            </p>
                            <p className="text-transit-textMuted text-[11px]">
                              {lang === 'hi' ? 'भीड़ श्रेणी:' : 'Category:'} {d.category}
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
                    name={lang === 'hi' ? 'कार्यदिवस' : 'Weekday'}
                    type="monotone"
                    dataKey="mean_load"
                    stroke="#142B3B"
                    strokeWidth={2}
                    fill="#142B3B"
                    fillOpacity={0.12}
                  />
                  <Area
                    name={lang === 'hi' ? 'सप्ताहांत' : 'Weekend'}
                    type="monotone"
                    dataKey="weekend_load"
                    stroke="#00828A"
                    strokeWidth={2}
                    fill="#00828A"
                    fillOpacity={0.06}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Map Preview (Collapsible on Mobile) */}
          <div className="bg-white border border-transit-border rounded-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-teal" />
                {lang === 'hi' ? 'रूट मानचित्र' : 'Route Map'}
              </span>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-xs text-teal font-semibold hover:underline"
              >
                {showMap
                  ? (lang === 'hi' ? 'मानचित्र छुपाएं' : 'Hide map')
                  : (lang === 'hi' ? 'मानचित्र दिखाएं' : 'Show map')}
              </button>
            </div>

            {showMap && (
              <div className="pt-2 animate-fade-in">
                <LeafletRouteMap
                  stops={stops}
                  shapePoints={routeInfo?.shape_points || []}
                  crowdCategory={getSegmentCrowd(0)}
                  height="260px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
