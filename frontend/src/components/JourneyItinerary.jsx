import React, { useRef } from 'react';
import { ArrowUpDown } from 'lucide-react';
import CrowdIndicator from './primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';
import { formatTime12h, getLegOccupancy, getSegmentColorClass, getStopCrowdColorClass, CANONICAL_DELHI_25_STOPS } from '../utils/formatters';

const addMinutes = (timeStr, mins) => {
  const parts = (timeStr || '18:00').split(':');
  let totalMinutes = parseInt(parts[0] || '18', 10) * 60 + parseInt(parts[1] || '00', 10) + mins;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export default function JourneyItinerary({
  option,
  departureTime = '18:00',
  onStopClick,
  className = '',
  style = {},
}) {
  const { lang } = useTranslation();
  const scrollViewportRef = useRef(null);

  if (!option) return null;

  const rawDep = option.scheduled_departure || departureTime || '18:00';
  const depTime24 = rawDep.length >= 5 ? rawDep.slice(0, 5) : rawDep;
  const durationMin = Math.round(
    option.timing?.total_duration_min ??
    option.total_time_min ??
    option.total_duration_minutes ??
    40
  );
  const arrTime24 = option.scheduled_arrival ? option.scheduled_arrival.slice(0, 5) : addMinutes(depTime24, durationMin);
  const depTime = formatTime12h(depTime24);
  const arrTime = formatTime12h(arrTime24);
  const routeNum = option.route_short_name || option.route_id || '73UP';
  const distKm = option.distance_km ?? option.timing?.distance_km ?? 13.4;
  const inVehMin = option.timing?.in_vehicle_min ?? option.timing?.travel_time_min ?? option.travel_time_min ?? durationMin;
  const approxSpeed = option.approx_speed_kmh ?? (distKm > 0 && inVehMin > 0 ? Math.round((Number(distKm) * 60) / inVehMin) : 20);
  const totalStops = option.stops_count ?? option.stops?.length ?? 25;

  const crowdCategory =
    option.crowding?.category ||
    option.crowding_category ||
    option.crowd_category ||
    'high';

  // Dynamic segments along the corridor using canonical civic transit colors
  const zoneBreakdown = option.crowding?.zone_breakdown || option.zone_forecasts || [];

  const stops = option.stops && option.stops.length > 0
    ? option.stops.map((s, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === option.stops.length - 1;
        const legOcc = getLegOccupancy(idx, option.stops.length, zoneBreakdown, crowdCategory);
        // Prefer explicit s.occupancyToNextStop / s.occupancy_to_next_stop; fallback to calibrated legOcc
        const occVal = (s.occupancyToNextStop !== undefined && s.occupancyToNextStop !== null)
          ? s.occupancyToNextStop
          : ((s.occupancy_to_next_stop !== undefined && s.occupancy_to_next_stop !== null)
              ? s.occupancy_to_next_stop
              : (legOcc.rci ? legOcc.rci / 100 : legOcc.category));

        const approxLoad = Math.max(1.5, Math.round(((legOcc.rci || 28) * 0.4) * 10) / 10);
        const approxBoard = isLast ? 0.0 : (isFirst ? Math.max(2.0, approxLoad) : Math.max(0.4, Math.round(approxLoad * 0.16 * 10) / 10));
        const approxAlight = isFirst ? 0.0 : (isLast ? approxLoad : Math.max(0.3, Math.round(approxLoad * 0.14 * 10) / 10));

        return {
          id: s.id || s.stop_id || `stop-${idx}`,
          stop_id: s.id || s.stop_id || `stop-${idx}`,
          name: s.name || s.stop_name || `Stop ${idx + 1}`,
          stop_name: s.name || s.stop_name || `Stop ${idx + 1}`,
          stop_sequence: idx,
          distanceKm: s.distanceKm || (typeof s.distance_km === 'string' ? s.distance_km : (typeof s.distance_km === 'number' ? (idx === 0 ? '0.0 km' : `+${s.distance_km.toFixed(1)} km`) : (idx === 0 ? '0.0 km' : `+${(idx * 0.5).toFixed(1)} km`))),
          time: s.time || s.arrival_time_12h || (idx === 0 ? depTime : isLast ? arrTime : ''),
          isOrigin: isFirst,
          isDestination: isLast,
          occupancyToNextStop: isLast ? null : occVal,
          running_load: approxLoad,
          boardings: approxBoard,
          alightings: approxAlight,
          crowd_level: legOcc.category || crowdCategory,
          sample_ticket_count: 24,
        };
      })
    : CANONICAL_DELHI_25_STOPS.map((s, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === CANONICAL_DELHI_25_STOPS.length - 1;
        const legOcc = getLegOccupancy(idx, CANONICAL_DELHI_25_STOPS.length, zoneBreakdown, crowdCategory);
        const approxTime = formatTime12h(addMinutes(depTime24, s.minOffset));
        const approxLoad = Math.max(1.5, Math.round(((legOcc.rci || 28) * 0.4) * 10) / 10);
        const approxBoard = isLast ? 0.0 : (isFirst ? Math.max(2.0, approxLoad) : Math.max(0.4, Math.round(approxLoad * 0.16 * 10) / 10));
        const approxAlight = isFirst ? 0.0 : (isLast ? approxLoad : Math.max(0.3, Math.round(approxLoad * 0.14 * 10) / 10));

        return {
          id: s.id,
          stop_id: s.id,
          name: s.name,
          stop_name: s.name,
          stop_sequence: idx,
          distanceKm: s.dist,
          time: isFirst ? depTime : (isLast ? arrTime : approxTime),
          isOrigin: isFirst,
          isDestination: isLast,
          occupancyToNextStop: isLast ? null : (legOcc.rci / 100),
          running_load: approxLoad,
          boardings: approxBoard,
          alightings: approxAlight,
          crowd_level: legOcc.category || crowdCategory,
          sample_ticket_count: 24,
        };
      });

  const toggleScrollTopEnd = () => {
    const el = scrollViewportRef.current || document.getElementById('stops-scroll-viewport');
    if (el) {
      el.scrollTo({
        top: el.scrollTop > 50 ? 0 : el.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={style}
      className={`bg-white border border-[#d8e6dd] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-full ${className}`}
    >
      {/* 1. Route Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8e6dd] pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#004327] text-white font-bold text-sm tracking-wide">
            {routeNum}
          </span>
          <div>
            <h2 className="text-base font-bold text-[#121e19]">
              {depTime} – {arrTime} • {durationMin} min
            </h2>
            <span className="text-xs text-[#404942]">
              {distKm} km route • ~{approxSpeed} km/h avg speed • {stops.length} stops • Scheduled service
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider">
            Crowd at {depTime}
          </span>
          <div className="mt-0.5 flex items-center gap-2">
            <CrowdIndicator category={crowdCategory} size="sm" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              (option.crowding?.peak_rci ?? option.rci ?? 28) >= 75
                ? 'bg-red-50 text-red-700 border-red-200'
                : (option.crowding?.peak_rci ?? option.rci ?? 28) >= 45
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              RCI {Math.round(option.crowding?.peak_rci ?? option.rci ?? 28)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Journey Stops and Schedule Card (Internal Scrollable Viewport filling available card height) */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Card Header (Pinned) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              {lang === 'hi' ? 'यात्रा स्टॉप और समय सारिणी' : 'Journey Stops and Schedule'}
            </h4>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              {stops.length} {lang === 'hi' ? 'स्टॉप' : 'stops'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-[#404942]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#145C3A]" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'कम भीड़' : 'Seats Available'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E0A51A]" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'मध्यम भीड़' : 'Standing Room'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C64B4B]" />
                <span className="hidden sm:inline">{lang === 'hi' ? 'अधिक भीड़' : 'Crowded'}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>{lang === 'hi' ? 'समय सारिणी सेवा' : 'Scheduled corridor service'}</span>
            </div>
          </div>
        </div>

        {/* Internal Scrollable Stops Viewport - Fills entire remaining vertical space */}
        <div
          id="stops-scroll-viewport"
          ref={scrollViewportRef}
          className="flex-1 overflow-y-auto min-h-0 pr-2 pt-3 space-y-0 scroll-smooth custom-scrollbar"
        >
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            const segmentColor = !isLast ? getSegmentColorClass(stop.occupancyToNextStop) : '';
            const nodeColorClass = getStopCrowdColorClass(stop, index, stops.length, zoneBreakdown, crowdCategory);

            return (
              <div
                key={stop.id || index}
                onClick={() =>
                  onStopClick &&
                  onStopClick({
                    ...stop,
                    stop_sequence: index,
                    stop_id: stop.id,
                    stop_name: stop.name,
                  })
                }
                className="flex items-start group cursor-pointer hover:bg-emerald-50/50 p-1 rounded-lg transition-colors"
                title={lang === 'hi' ? 'स्टॉप प्रवाह देखने के लिए क्लिक करें' : 'Click to inspect stop-level passenger flow'}
              >
                {/* Spine Column with Dots and Crowd-Colored Segments */}
                <div className="flex flex-col items-center mr-3 w-4 flex-shrink-0">
                  {/* Node Dot (Filled based on expected crowd at that particular stop) */}
                  {isFirst ? (
                    <div className={`w-3.5 h-3.5 rounded-full border-[3px] ${nodeColorClass === 'bg-[#C64B4B]' ? 'border-[#C64B4B]' : nodeColorClass === 'bg-[#E0A51A]' ? 'border-[#E0A51A]' : 'border-[#145C3A]'} bg-white ring-2 ring-white flex-shrink-0 z-10`} />
                  ) : isLast ? (
                    <div className={`w-3.5 h-3.5 rounded-full ${nodeColorClass} ring-4 ring-emerald-100 ring-offset-1 flex-shrink-0 z-10`} />
                  ) : (
                    <div className={`w-2.5 h-2.5 my-0.5 rounded-full ${nodeColorClass} ring-2 ring-white flex-shrink-0 z-10 transition-colors duration-200`} />
                  )}

                  {/* Dynamic Occupancy Colored Connecting Line (rendered except on final stop) */}
                  {!isLast && (
                    <div className={`w-[3px] h-8 ${segmentColor} rounded-full my-0.5 transition-colors duration-200`} />
                  )}
                </div>

                {/* Stop Info Details */}
                <div className={`pt-0 ${isLast ? '' : 'pb-3'} flex-1 flex items-baseline justify-between min-w-0`}>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs ${isFirst || isLast ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {stop.name}
                      </span>
                      {isFirst && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider">
                          {lang === 'hi' ? 'बोर्ड करें' : 'BOARD HERE'}
                        </span>
                      )}
                      {isLast && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 tracking-wider">
                          {lang === 'hi' ? 'उतरें' : 'ALIGHT'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {stop.distanceKm}
                    </div>
                  </div>
                  <span className={`text-xs ${isFirst || isLast ? 'font-semibold text-gray-700' : 'text-gray-600'} shrink-0 ml-2`}>
                    {stop.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pinned Control Footer (Replaces '+17 more stops') */}
        <div className="flex-shrink-0 mt-auto pt-3 border-t border-emerald-100/70 bg-emerald-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
            <svg className="w-3.5 h-3.5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>
              {lang === 'hi' ? `सभी ${stops.length} स्टॉप देखने के लिए स्क्रॉल करें` : `Scroll to preview all ${stops.length} stops`}
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
    </div>
  );
}
