import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CrowdIndicator from './primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';
import { formatTime12h } from '../utils/formatters';

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
  className = '',
}) {
  const { lang } = useTranslation();
  const [showAll, setShowAll] = useState(false);

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
  const totalStops = option.stops_count ?? option.stops?.length ?? 25;

  const crowdCategory =
    option.crowding?.category ||
    option.crowding_category ||
    option.crowd_category ||
    'high';

  // Dynamic segments along the corridor using only the 3 canonical crowd colors
  const zoneBreakdown = option.crowding?.zone_breakdown || option.zone_forecasts || [];

  const corridorSegments = zoneBreakdown.length > 0
    ? zoneBreakdown.map((z) => {
        const cat = (z.category || z.crowd_level || '').toLowerCase();
        let bg = '#94a3b8'; // grey unknown
        if (cat.includes('low') || cat.includes('not')) bg = '#10b981';
        else if (cat.includes('mod') || cat.includes('fairly')) bg = '#f59e0b';
        else if (cat.includes('high') || cat.includes('very')) bg = '#ef4444';
        return {
          name: z.zone_name || `Zone ${z.zone_id}`,
          color: bg,
          level: cat.includes('low') ? 'Not crowded' : cat.includes('mod') ? 'Fairly crowded' : cat.includes('high') ? 'Very crowded' : 'Not enough data',
          width: `${Math.max(15, Math.floor(100 / zoneBreakdown.length))}%`,
        };
      })
    : [
        // Default 3 corridor sections colored by the 3 canonical colors
        {
          name: 'Origin corridor',
          color: crowdCategory === 'low' ? '#10b981' : crowdCategory === 'moderate' ? '#f59e0b' : '#ef4444',
          level: crowdCategory === 'low' ? 'Not crowded' : crowdCategory === 'moderate' ? 'Fairly crowded' : 'Very crowded',
          width: '35%',
        },
        {
          name: 'Mid-route corridor',
          color: crowdCategory === 'high' ? '#ef4444' : '#f59e0b',
          level: crowdCategory === 'high' ? 'Very crowded' : 'Fairly crowded',
          width: '35%',
        },
        {
          name: 'Destination stretch',
          color: '#10b981',
          level: 'Not crowded',
          width: '30%',
        },
      ];

  const stops = option.stops && option.stops.length > 0
    ? option.stops.map((s, idx) => ({
        name: s.stop_name || `Stop ${idx + 1}`,
        dist: idx === 0 ? '0.0 km' : `+${(idx * 0.5).toFixed(1)} km`,
        time: s.arrival_time_12h || (idx === 0 ? depTime : idx === option.stops.length - 1 ? arrTime : ''),
        isBoarding: idx === 0,
        isAlighting: idx === option.stops.length - 1,
        // No duplicate "BOARD HERE" in note
        note: null,
      }))
    : [
        { name: 'Boarding Terminal', dist: '0.0 km', time: depTime, isBoarding: true, note: null },
        { name: 'En-route Stop 1', dist: '+2.5 km', time: formatTime12h(addMinutes(depTime24, 8)), isBoarding: false, note: null },
        { name: 'En-route Stop 2', dist: '+5.0 km', time: formatTime12h(addMinutes(depTime24, 16)), isBoarding: false, note: null },
        { name: 'En-route Stop 3', dist: '+8.2 km', time: formatTime12h(addMinutes(depTime24, 25)), isBoarding: false, note: null },
        { name: 'Alighting Terminal', dist: `+${distKm} km`, time: arrTime, isAlighting: true, note: null },
      ];

  const visibleStops = showAll ? stops : stops.slice(0, 8);
  const remainingCount = stops.length - 8;

  return (
    <div className={`bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm space-y-5 ${className}`}>
      {/* 1. Route Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8e6dd] pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#004327] text-white font-bold text-sm tracking-wide">
            {routeNum}
          </span>
          <div>
            <h2 className="text-base font-bold text-[#121e19]">
              {depTime} – {arrTime} • {durationMin} min
            </h2>
            <span className="text-xs text-[#404942]">
              {distKm} km route • {totalStops} stops • Scheduled service
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-bold text-[#707971] uppercase tracking-wider">
            Crowd at {depTime}
          </span>
          <div className="mt-0.5">
            <CrowdIndicator category={crowdCategory} size="sm" />
          </div>
        </div>
      </div>

      {/* 2. Segmented Crowd Density Along Corridor */}
      <div className="flex flex-col gap-2.5 bg-[#e9f7ee]/60 p-3.5 rounded-xl border border-[#d8e6dd]">
        <div className="flex justify-between text-xs text-[#121e19] font-bold">
          <span className="uppercase tracking-wider text-[11px]">CROWD ALONG THE ROUTE</span>
          <span className="text-[#707971] font-normal text-[11px]">Estimated zone demand</span>
        </div>

        {/* Segmented Color Track (3 canonical crowd colors + grey for unknown) */}
        <div className="w-full h-3 rounded flex overflow-hidden gap-0.5 bg-[#e2e8f0]">
          {corridorSegments.map((seg, idx) => (
            <div
              key={idx}
              className="h-full first:rounded-l last:rounded-r transition-all"
              style={{ width: seg.width, backgroundColor: seg.color }}
              title={`${seg.name}: ${seg.level}`}
            />
          ))}
        </div>

        {/* Small Legend below corridor track */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#404942] pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Not crowded</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span>Fairly crowded</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Very crowded</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#94a3b8]" />
              <span>Not enough data</span>
            </span>
          </div>
          <span className="text-[#707971]">Relative to typical corridor loads</span>
        </div>
      </div>

      {/* 3. Stop-By-Stop Vertical Timeline */}
      <div className="flex flex-col space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#121e19] uppercase tracking-wider">
            JOURNEY STOPS AND SCHEDULE
          </span>
          <span className="text-[11px] text-[#707971]">Timetable Scheduled</span>
        </div>

        <div className="relative pl-6 flex flex-col">
          {/* Continuous Timeline Vertical Guideline */}
          <div className="absolute left-2.5 top-2.5 bottom-4 w-0.5 bg-[#d8e6dd]" />

          {visibleStops.map((stop, idx) => (
            <div key={idx} className="relative pb-3.5 flex items-start justify-between">
              {/* Marker Circle */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                  stop.isBoarding
                    ? 'bg-[#004327]'
                    : stop.isAlighting
                    ? 'bg-[#121e19]'
                    : 'bg-[#94a3b8]'
                }`}
              >
                <div className={`rounded-full ${stop.isBoarding || stop.isAlighting ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white'}`} />
              </div>

              {/* Stop info */}
              <div className="flex flex-col pl-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${stop.isBoarding || stop.isAlighting ? 'text-[#121e19]' : 'text-[#404942]'}`}>
                    {stop.name}
                  </span>
                  {stop.isBoarding && (
                    <span className="px-1.5 py-0.5 rounded bg-[#004327] text-white text-[9px] font-bold uppercase tracking-wider">
                      BOARD HERE
                    </span>
                  )}
                  {stop.isAlighting && (
                    <span className="px-1.5 py-0.5 rounded bg-[#121e19] text-white text-[9px] font-bold uppercase tracking-wider">
                      ALIGHT HERE
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#707971]">
                  {stop.dist} {stop.note ? `• ${stop.note}` : ''}
                </span>
              </div>

              {/* Stop Scheduled Time */}
              <span className="text-xs font-semibold text-[#121e19] shrink-0">
                {stop.time}
              </span>
            </div>
          ))}

          {/* Toggle remaining stops */}
          {remainingCount > 0 && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs text-[#136c46] hover:text-[#004327] font-semibold py-2 text-left flex items-center gap-1 cursor-pointer pl-2"
            >
              <span>+ {remainingCount} more stops · Show complete corridor schedule</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {showAll && (
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="text-xs text-[#136c46] hover:text-[#004327] font-semibold py-2 text-left flex items-center gap-1 cursor-pointer pl-2"
            >
              <span>Show fewer stops</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
