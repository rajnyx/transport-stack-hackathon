import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Map as MapIcon,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Download,
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
  ReferenceLine,
} from 'recharts';
import { getRouteDetails, getRouteCrowdProfile, getRouteFlow } from '../api';
import RouteBadge from '../components/primitives/RouteBadge';
import CrowdStrip from '../components/primitives/CrowdStrip';
import LeafletRouteMap from '../components/LeafletRouteMap';
import SegmentedControl from '../components/primitives/SegmentedControl';
import StopFlowDrawer from '../components/StopFlowDrawer';
import { useTranslation } from '../i18n/LanguageContext';

function RouteDetailsSkeleton() {
  return (
    <div className="py-4 space-y-4 animate-pulse">
      {/* Route Header Skeleton */}
      <div className="bg-white border border-transit-border rounded-panel p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-16 h-8 bg-transit-borderSubtle rounded-[4px]" />
            <div className="space-y-1.5">
              <div className="w-48 h-5 bg-transit-borderSubtle rounded-[2px]" />
              <div className="w-32 h-3.5 bg-transit-borderSubtle rounded-[2px]" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-7 bg-transit-borderSubtle rounded-full" />
            <div className="w-16 h-7 bg-transit-borderSubtle rounded-full" />
            <div className="w-16 h-7 bg-transit-borderSubtle rounded-full" />
          </div>
        </div>
        <div className="pt-2 border-t border-transit-border flex items-center justify-between">
          <div className="w-44 h-7 bg-transit-borderSubtle rounded-[4px]" />
          <div className="w-32 h-7 bg-transit-borderSubtle rounded-[4px]" />
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 bg-white border border-transit-border rounded-panel p-4 h-[680px] flex flex-col justify-between">
          <div className="w-40 h-5 bg-transit-borderSubtle rounded-[2px]" />
          <div className="space-y-4 py-4 flex-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-transit-borderSubtle shrink-0" />
                <div className="w-3/5 h-4 bg-transit-borderSubtle rounded-[2px]" />
                <div className="w-16 h-3 bg-transit-borderSubtle rounded-[2px] ml-auto" />
              </div>
            ))}
          </div>
          <div className="w-full h-8 bg-transit-borderSubtle rounded-[4px]" />
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-transit-border rounded-panel p-4 h-[320px]">
            <div className="w-56 h-5 bg-transit-borderSubtle rounded-[2px] mb-4" />
            <div className="w-full h-56 bg-transit-borderSubtle rounded-[4px]" />
          </div>
          <div className="bg-white border border-transit-border rounded-panel p-4 h-[340px]">
            <div className="w-40 h-5 bg-transit-borderSubtle rounded-[2px] mb-4" />
            <div className="w-full h-64 bg-transit-borderSubtle rounded-[4px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteDetailsPage() {
  const { id: rawRouteId = '101UP' } = useParams();
  const routeId = rawRouteId ? rawRouteId.toUpperCase() : '101UP';
  const { t, lang } = useTranslation();

  const [routeInfo, setRouteInfo] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [weekendProfileData, setWeekendProfileData] = useState(null);
  const [dayType, setDayType] = useState('WEEKDAY');
  const [selectedHour, setSelectedHour] = useState(18); // Default 6:00 pm peak
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stop Flow Drawer State
  const [flowDrawerOpen, setFlowDrawerOpen] = useState(false);
  const [selectedStopForFlow, setSelectedStopForFlow] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [flowLoading, setFlowLoading] = useState(false);

  // Height sync & scroll refs
  const rightColRef = useRef(null);
  const scrollRef = useRef(null);
  const [leftHeight, setLeftHeight] = useState(null);

  useEffect(() => {
    document.title = `Route ${routeId} Crowding & Schedule | CrowdWise Delhi`;
  }, [routeId]);

  const loadData = () => {
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
        } else if (!routeRes.ok) {
          setError(
            routeRes.error?.message ||
              (lang === 'hi'
                ? `रूट ${routeId} की जानकारी प्राप्त नहीं हो सकी।`
                : `Could not retrieve details for Route ${routeId}.`)
          );
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
  };

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [routeId, dayType, lang]);

  const routeDirection = routeId.toUpperCase().endsWith('DOWN') ? 'DOWN' : 'UP';

  useEffect(() => {
    let isMounted = true;
    setFlowLoading(true);
    getRouteFlow(routeId, {
      direction: routeDirection,
      hour: selectedHour,
      dayType: dayType.toLowerCase(),
    })
      .then((res) => {
        if (!isMounted) return;
        if (res?.data) {
          setFlowData(res.data);
        }
        setFlowLoading(false);
      })
      .catch(() => {
        if (isMounted) setFlowLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [routeId, routeDirection, selectedHour, dayType]);

  // Synchronize the height of the left Stop Timeline card with the right column (Diurnal Chart + Map)
  const stops = routeInfo?.stops || [];
  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 1024 && rightColRef.current) {
        const h = rightColRef.current.offsetHeight;
        if (h > 300) {
          setLeftHeight(h);
          return;
        }
      }
      setLeftHeight(null);
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && rightColRef.current) {
      ro = new ResizeObserver(() => {
        updateHeight();
      });
      ro.observe(rightColRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [profileData, weekendProfileData, routeInfo, stops.length]);

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

  // Compute dynamic takeaway sentence reflecting the chosen day type and hour
  const takeawaySentence = useMemo(() => {
    const isPeakHour = (selectedHour >= 8 && selectedHour <= 10) || (selectedHour >= 17 && selectedHour <= 20);
    const hourLabel = `${selectedHour % 12 || 12}:00 ${selectedHour >= 12 ? 'pm' : 'am'}`;
    const dayLabel = dayType === 'WEEKDAY' ? (lang === 'hi' ? 'कार्यदिवस' : 'weekday') : (lang === 'hi' ? 'सप्ताहांत' : 'weekend');

    if (lang === 'hi') {
      if (dayType === 'SUNDAY') {
        return `रविवार को ${hourLabel} पर इस रूट पर सामान्यतः काफी कम भीड़ रहती है।`;
      }
      return isPeakHour
        ? `${dayLabel} को ${hourLabel} पर यह रूट अत्यधिक व्यस्त (पीक ऑवर) रहता है — सीट मिलने की संभावना कम है।`
        : `${dayLabel} को ${hourLabel} पर भीड़ मध्यम रहती है — यात्रा के लिए अनुकूल समय।`;
    }

    if (dayType === 'SUNDAY') {
      return `On Sunday at ${hourLabel}, crowd levels are noticeably lighter across the corridor.`;
    }
    return isPeakHour
      ? `At ${hourLabel} (${dayLabel}), this corridor reaches peak passenger accumulation with standing room likely.`
      : `At ${hourLabel} (${dayLabel}), crowd levels are moderate with seats available on most sections.`;
  }, [selectedHour, dayType, lang]);

  const routeNum = routeInfo?.route_short_name || routeId;

  // Segment crowd level computation for chosen hour — dynamically reflects selectedHour, dayType, and stop position
  const getSegmentCrowd = (stopIndex) => {
    // Check flowData first if available
    if (flowData?.stops && Array.isArray(flowData.stops) && flowData.stops[stopIndex]) {
      const stopFlow = flowData.stops[stopIndex];
      const level = (stopFlow.crowd_level || stopFlow.crowd_category || stopFlow.category || '').toLowerCase();
      if (level.includes('crowd') || level.includes('high')) return 'high';
      if (level.includes('standing') || level.includes('moderate')) return 'moderate';
      
      const load = stopFlow.running_load ?? stopFlow.estimated_load ?? stopFlow.mean_load;
      if (load !== undefined && load !== null && load > 2) {
        if (load >= 35) return 'high';
        if (load >= 18) return 'moderate';
        return 'low';
      }
    }

    // Dynamic corridor crowding calculation based on chosen hour, day type, and stop position
    const isPeakHour = (selectedHour >= 8 && selectedHour <= 10) || (selectedHour >= 17 && selectedHour <= 20);
    const isMidday = selectedHour >= 11 && selectedHour <= 16;
    const isLateNight = selectedHour >= 22 || selectedHour <= 5;

    const dayFactor = dayType === 'WEEKDAY' ? 1.0 : dayType === 'SATURDAY' ? 0.72 : 0.45;

    // Mid-corridor accumulation curve (stops 20% to 80% have maximum load)
    const totalStops = Math.max(1, (stops?.length || 40));
    const posFraction = stopIndex / totalStops;
    const positionIntensity = Math.sin(Math.max(0, Math.min(1, posFraction)) * Math.PI);

    let baseLoad = 10;
    if (isPeakHour) {
      baseLoad = 38 * dayFactor;
    } else if (isMidday) {
      baseLoad = 22 * dayFactor;
    } else if (isLateNight) {
      baseLoad = 4 * dayFactor;
    } else {
      baseLoad = 14 * dayFactor;
    }

    const effectiveLoad = baseLoad * (0.35 + 0.95 * positionIntensity);

    if (effectiveLoad >= 28) return 'high';
    if (effectiveLoad >= 15) return 'moderate';
    return 'low';
  };

  // Polyline coordinates for high-res map track
  const shapePoints = useMemo(() => {
    if (routeInfo?.shape_points && routeInfo.shape_points.length > 0) {
      return routeInfo.shape_points;
    }
    if (routeInfo?.polyline_coords && routeInfo.polyline_coords.length > 0) {
      return routeInfo.polyline_coords.map((p) => ({
        lat: p[0],
        lon: p[1],
      }));
    }
    return [];
  }, [routeInfo]);

  // Toggle scroll position between top and bottom of stop list
  const toggleScrollTopEnd = () => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollTop > 50 ? 0 : el.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Loading skeleton state
  if (loading && !routeInfo) {
    return <RouteDetailsSkeleton />;
  }

  // Error state
  if (error && !routeInfo) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <div className="p-6 bg-white border border-transit-border rounded-panel shadow-sm text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy">
              {lang === 'hi' ? 'रूट विवरण नहीं मिला' : 'Route Details Unavailable'}
            </h2>
            <p className="text-xs text-transit-textMuted mt-1">
              {error}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/results"
              className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-[4px] hover:bg-navy/90 transition-colors"
            >
              {lang === 'hi' ? 'खोज पर वापस जाएं' : 'Back to Journey Planner'}
            </Link>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 bg-white border border-transit-border text-xs font-semibold text-navy rounded-[4px] hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
          </div>

          {/* Quick link to known good routes */}
          <div className="pt-3 border-t border-transit-border text-xs text-transit-textMuted">
            <span>{lang === 'hi' ? 'उपलब्ध रूट आज़माएं: ' : 'Try available routes: '}</span>
            <div className="inline-flex gap-1.5 ml-1">
              {['73UP', '85DOWN', '108AUP'].map((r) => (
                <Link
                  key={r}
                  to={`/route/${r}`}
                  className="font-bold text-teal hover:underline"
                >
                  {r}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Route Export Buttons (F7) */}
          <div className="flex items-center gap-2">
            <a
              href={`/api/routes/${encodeURIComponent(routeId)}/export?format=csv&day_type=${dayType.toLowerCase()}&hour=${selectedHour}`}
              download={`${routeId}_crowd_estimates.csv`}
              className="px-2.5 py-1 bg-white border border-transit-border rounded-[4px] text-xs font-semibold text-navy hover:bg-slate-50 inline-flex items-center gap-1 shadow-2xs transition-colors"
              title={lang === 'hi' ? 'रूट सीएसवी डाउनलोड करें' : 'Export Route CSV'}
            >
              <Download className="w-3.5 h-3.5 text-teal" />
              <span>{lang === 'hi' ? 'सीएसवी' : 'CSV'}</span>
            </a>
            <a
              href={`/api/routes/${encodeURIComponent(routeId)}/export?format=json&day_type=${dayType.toLowerCase()}&hour=${selectedHour}`}
              download={`${routeId}_crowd_estimates.json`}
              className="px-2.5 py-1 bg-white border border-transit-border rounded-[4px] text-xs font-semibold text-navy hover:bg-slate-50 inline-flex items-center gap-1 shadow-2xs transition-colors"
              title={lang === 'hi' ? 'रूट जेसन डाउनलोड करें' : 'Export Route JSON'}
            >
              <Download className="w-3.5 h-3.5 text-teal" />
              <span>{lang === 'hi' ? 'जेसन' : 'JSON'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Vertical Timeline (Left) & Diurnal Chart + Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Vertical Stop Timeline with Crowd Colors (6 cols) */}
        <div
          style={leftHeight ? { height: `${leftHeight}px`, maxHeight: `${leftHeight}px` } : {}}
          className="lg:col-span-6 bg-white border border-transit-border rounded-panel p-4 flex flex-col justify-between overflow-hidden shadow-xs"
        >
          {/* Card Header (Pinned) */}
          <div className="flex items-center justify-between border-b border-transit-border pb-2.5 flex-shrink-0">
            <div>
              <h2 className="text-sm font-bold text-navy">
                {lang === 'hi' ? 'स्टॉप समयरेखा और भीड़ स्तर' : 'Stop Timeline & Crowding'}
              </h2>
              <p className="text-[11px] text-transit-textMuted">
                {selectedHour % 12 || 12}:00 {selectedHour >= 12 ? 'pm' : 'am'} ({dayType.toLowerCase()})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                {stops.length} {lang === 'hi' ? 'स्टॉप' : 'stops'}
              </span>
              <CrowdStrip category={getSegmentCrowd(0)} size="sm" />
            </div>
          </div>

          {/* Timeline List - Scrollable viewport matching the map height */}
          <div
            ref={scrollRef}
            id="route-stops-scroll-viewport"
            className="space-y-0 flex-1 min-h-0 overflow-y-auto pr-2 mt-3 custom-scrollbar"
          >
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
                <div
                  key={stop.stop_id || stop.id || idx}
                  onClick={() => {
                    setSelectedStopForFlow({
                      ...stop,
                      stop_sequence: idx,
                      stop_id: stop.stop_id || stop.id,
                      stop_name: stop.stop_name || stop.name,
                    });
                    setFlowDrawerOpen(true);
                  }}
                  className="relative flex items-start cursor-pointer hover:bg-emerald-50/60 p-1.5 -mx-1.5 rounded-xl transition-all duration-150 group"
                  title={lang === 'hi' ? 'यात्री प्रवाह देखने के लिए क्लिक करें' : 'Click to inspect passenger flow metrics'}
                >
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs ${isFirst || isLast ? 'font-bold text-navy' : 'font-semibold text-navy'} truncate block`}>
                          {stop.stop_name || stop.name || `Stop #${idx + 1}`}
                        </span>
                        {isFirst && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider">
                            {lang === 'hi' ? 'बोर्ड करें' : 'BOARD'}
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 tracking-wider">
                            {lang === 'hi' ? 'उतरें' : 'ALIGHT'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-transit-textMuted font-mono">
                        {stop.stop_id || stop.id} • {(() => {
                          const depH = selectedHour;
                          const approxMin = (idx * 2) % 60;
                          const period = depH >= 12 ? 'pm' : 'am';
                          const h12 = depH % 12 || 12;
                          return `${h12}:${String(approxMin).padStart(2, '0')} ${period}`;
                        })()}
                      </span>
                    </div>

                    {!isLast && (
                      <span className={`text-[11px] font-semibold shrink-0 transition-colors duration-150 ${
                        segCrowd === 'high'
                          ? 'text-[#C64B4B]'
                          : segCrowd === 'moderate'
                          ? 'text-[#B47805]'
                          : 'text-[#145C3A]'
                      }`}>
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

          {/* Bottom Pinned Control Footer (Matching user's Image 2 reference) */}
          <div className="flex-shrink-0 mt-3 pt-2.5 border-t border-emerald-100/70 bg-emerald-50/50 -mx-4 -mb-4 px-4 py-2.5 rounded-b-panel flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
              <svg
                className="w-3.5 h-3.5 text-emerald-700 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              <span>
                {lang === 'hi'
                  ? `सभी ${stops.length} स्टॉप देखने के लिए स्क्रॉल करें`
                  : `Scroll to preview all ${stops.length} stops`}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleScrollTopEnd}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{lang === 'hi' ? 'ऊपर / नीचे' : 'Toggle top / end'}</span>
              <ArrowUpDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Diurnal Crowding Profile Chart & Map (6 cols) */}
        <div ref={rightColRef} className="lg:col-span-6 flex flex-col space-y-4">
          {/* Diurnal Chart Card */}
          <div className="bg-white border border-transit-border rounded-panel p-4 space-y-3 flex-shrink-0">
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
                  <ReferenceLine
                    x={`${selectedHour % 12 || 12} ${selectedHour >= 12 ? 'pm' : 'am'}`}
                    stroke="#145C3A"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Route Map Card (Always Visible) */}
          <div className="bg-white border border-transit-border rounded-panel p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <MapIcon className="w-3.5 h-3.5 text-teal" />
                {lang === 'hi' ? 'रूट मानचित्र' : 'Route Map'}
              </span>
              <span className="text-[11px] text-transit-textMuted font-medium">
                {stops.length} {lang === 'hi' ? 'स्टॉप' : 'stops'} • {routeInfo?.total_distance_km || routeInfo?.distance_km || '24.0'} km corridor
              </span>
            </div>

            <div className="pt-1">
              <LeafletRouteMap
                stops={stops}
                shapePoints={shapePoints}
                height="300px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* F6 Stop Flow Drawer */}
      <StopFlowDrawer
        isOpen={flowDrawerOpen}
        onClose={() => setFlowDrawerOpen(false)}
        routeId={routeNum}
        selectedStop={selectedStopForFlow}
        flowData={flowData}
        onSelectStop={(stop) => setSelectedStopForFlow(stop)}
        hour={selectedHour}
        dayType={dayType}
        loading={flowLoading}
      />
    </div>
  );
}
