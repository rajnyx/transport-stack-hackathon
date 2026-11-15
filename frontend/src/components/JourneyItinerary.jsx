import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CrowdIndicator from './primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * JourneyItinerary — Matches Stitch Journey Results Right Column:
 * - Route header: "73UP", "6:00 pm – 6:40 pm • 40 min", "13.4 km route • 25 stops • Scheduled service"
 * - Crowd status: "Crowd at 6:00 PM: 👥 Very crowded"
 * - "CROWD ALONG THE ROUTE" segmented corridor heat strip:
 *   - 25% Error (#c64b4b) - Anand Vihar to Preet Vihar: High
 *   - 30% Dark Red (#ba1a1a) - Preet Vihar to Laxmi Nagar: Very High
 *   - 20% Soft Red (#ffdad6) - ITO Bridge Corridor: High
 *   - 15% Mint Grey (#d8e6dd) - Mandi House: Moderate
 *   - 10% Secondary Green (#25865a) - Shivaji Stadium: Low
 * - Origin & Destination labels
 * - "JOURNEY STOPS AND SCHEDULE" vertical stop-by-stop timeline with boarding badge
 */
const formatTime12h = (timeStr) => {
  if (!timeStr) return '6:00 pm';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return timeStr;
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const addMinutes = (timeStr, mins) => {
  const parts = (timeStr || '18:00').split(':');
  let totalMinutes = parseInt(parts[0] || '18', 10) * 60 + parseInt(parts[1] || '00', 10) + mins;
  totalMinutes = (totalMinutes % 1440 + 1440) % 1440;
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

  // Realistic corridor stops with timing and distances calculated from user departure time
  const fallbackStops = [
    { name: 'Anand Vihar ISBT', dist: '0.0 km', time: depTime, isBoarding: true, note: 'Platform 4 • Terminal Bay' },
    { name: 'Anand Vihar ISBT Main Road', dist: '+0.2 km', time: formatTime12h(addMinutes(depTime24, 1)) },
    { name: 'EDM Mall / Gazipur Depot', dist: '+0.6 km', time: formatTime12h(addMinutes(depTime24, 3)) },
    { name: 'Hasanpur Village', dist: '+1.0 km', time: formatTime12h(addMinutes(depTime24, 5)) },
    { name: 'Hasanpur Depot', dist: '+1.6 km', time: formatTime12h(addMinutes(depTime24, 8)) },
    { name: 'Karkardooma Crossing', dist: '+3.2 km', time: formatTime12h(addMinutes(depTime24, 11)) },
    { name: 'New Rajdhani Enclave / Preet Vihar Metro', dist: '+3.4 km', time: formatTime12h(addMinutes(depTime24, 13)) },
    { name: 'Swasthya Vihar / Preet Vihar', dist: '+3.9 km', time: formatTime12h(addMinutes(depTime24, 15)) },
    { name: 'Nirman Vihar', dist: '+4.4 km', time: formatTime12h(addMinutes(depTime24, 17)) },
    { name: 'Shakarpur Crossing', dist: '+4.7 km', time: formatTime12h(addMinutes(depTime24, 19)) },
    { name: 'Laxmi Nagar Metro Station', dist: '+5.3 km', time: formatTime12h(addMinutes(depTime24, 21)) },
    { name: 'Rainy Well / Shakarpur', dist: '+6.1 km', time: formatTime12h(addMinutes(depTime24, 23)) },
    { name: 'Delhi Secretariat / ITO Bridge', dist: '+7.4 km', time: formatTime12h(addMinutes(depTime24, 26)) },
    { name: 'ITO Vikas Minar', dist: '+8.2 km', time: formatTime12h(addMinutes(depTime24, 28)) },
    { name: 'Tilak Bridge', dist: '+9.0 km', time: formatTime12h(addMinutes(depTime24, 30)) },
    { name: 'Mandi House', dist: '+10.1 km', time: formatTime12h(addMinutes(depTime24, 32)) },
    { name: 'Barakhamba Road Metro', dist: '+11.2 km', time: formatTime12h(addMinutes(depTime24, 35)) },
    { name: 'Statesman House', dist: '+12.0 km', time: formatTime12h(addMinutes(depTime24, 37)) },
    { name: 'Shivaji Stadium Terminal', dist: '+13.4 km', time: arrTime, isAlighting: true, note: 'Alighting Platform' },
  ];

  const stops = option.stops && option.stops.length > 5
    ? option.stops.map((s, idx) => ({
        name: s.stop_name || `Stop ${idx + 1}`,
        dist: idx === 0 ? '0.0 km' : `+${(idx * 0.5).toFixed(1)} km`,
        time: s.arrival_time_12h || (idx === 0 ? depTime : idx === option.stops.length - 1 ? arrTime : ''),
        isBoarding: idx === 0,
        isAlighting: idx === option.stops.length - 1,
        note: idx === 0 ? 'BOARD HERE' : idx === option.stops.length - 1 ? 'ALIGHT HERE' : null,
      }))
    : fallbackStops;

  const visibleStops = showAll ? stops : stops.slice(0, 8);
  const remainingCount = stops.length - 8;

  return (
    <div className={`bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-sm space-y-5 ${className}`}>
      {/* 1. Route Summary Header matching Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8e6dd] pb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#004327] text-white font-mono font-bold text-sm tracking-wide">
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
      <div className="flex flex-col gap-2 bg-[#e9f7ee]/60 p-3.5 rounded-xl border border-[#d8e6dd]/60">
        <div className="flex justify-between text-xs text-[#121e19] font-bold">
          <span className="uppercase tracking-wider text-[11px]">CROWD ALONG THE ROUTE</span>
          <span className="text-[#707971] font-normal text-[11px]">Peak crowding across Yamuna crossing</span>
        </div>

        {/* Segmented Color Track */}
        <div className="w-full h-3 rounded flex overflow-hidden gap-0.5 bg-[#d8e6dd]">
          <div className="h-full bg-[#c64b4b] rounded-l" style={{ width: '25%' }} title="Anand Vihar to Preet Vihar: High" />
          <div className="h-full bg-[#ba1a1a]" style={{ width: '30%' }} title="Preet Vihar to Laxmi Nagar: Very High" />
          <div className="h-full bg-[#ffdad6]" style={{ width: '20%' }} title="ITO Bridge Corridor: High" />
          <div className="h-full bg-[#d8e6dd]" style={{ width: '15%' }} title="Mandi House: Moderate" />
          <div className="h-full bg-[#25865a] rounded-r" style={{ width: '10%' }} title="Shivaji Stadium: Low" />
        </div>

        <div className="flex justify-between text-[11px] text-[#404942]">
          <span>Anand Vihar ISBT</span>
          <span className="hidden sm:inline">ITO Bridge</span>
          <span>Shivaji Stadium</span>
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
                    : 'bg-[#bfc9c0]'
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
                    <span className="px-1.5 py-0.2 rounded bg-[#004327] text-white text-[9px] font-bold uppercase tracking-wider">
                      BOARD HERE
                    </span>
                  )}
                  {stop.isAlighting && (
                    <span className="px-1.5 py-0.2 rounded bg-[#121e19] text-white text-[9px] font-bold uppercase tracking-wider">
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
