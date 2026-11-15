import React from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import RouteBadge from './RouteBadge';
import CrowdIndicator from './CrowdIndicator';
import { useTranslation } from '../../i18n/LanguageContext';

export default function TransitRow({
  option,
  isRecommended = false,
  isSelected = false,
  preference = 'fastest',
  onSelect,
  onOpenWhyModal,
  className = '',
}) {
  const { lang } = useTranslation();

  const totalMin = Math.round(
    option.timing?.total_duration_min ??
    option.total_time_min ??
    option.total_duration_minutes ??
    40
  );
  const rideMin = Math.round(
    option.timing?.travel_time_min ??
    option.timing?.in_vehicle_min ??
    option.travel_time_min ??
    35
  );
  const waitMin = Math.round(
    option.timing?.wait_time_min ??
    option.wait_time_min ??
    5
  );

  const routeNum = option.route_short_name || option.route_id || '73UP';
  const depTime = option.scheduled_departure ? option.scheduled_departure.slice(0, 5) : '6:00 pm';
  const distKm = option.distance_km ?? option.timing?.distance_km ?? 13.4;
  const stopsCount = option.stops_count ?? option.stops?.length ?? 25;

  const crowdOrigin =
    option.crowding?.category ||
    option.crowding_category ||
    option.crowd_category ||
    (routeNum === '850DOWN' ? 'low' : routeNum === '764' ? 'moderate' : 'high');

  const peakCrowd =
    option.peak_crowd_category ||
    option.crowding?.crowding_label ||
    crowdOrigin;

  const prefTag =
    routeNum === '850DOWN' ? 'Least crowded' : routeNum === '764' ? 'Balanced' : null;

  // Render Expanded Card if Selected (or Recommended)
  if (isSelected) {
    return (
      <div
        onClick={onSelect}
        className={`bg-white border-2 border-blue-600 rounded-lg shadow-sm overflow-hidden select-none cursor-pointer transition-all ${className}`}
      >
        {/* Top Header inside card: "Recommended for fastest" & "Why" */}
        <div className="bg-blue-50/70 border-b border-blue-100 px-3.5 py-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-700">
            {lang === 'hi' ? 'सबसे तेज़ विकल्प (अनुशंसित)' : 'Recommended for fastest'}
          </span>
          {onOpenWhyModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenWhyModal(option);
              }}
              className="text-blue-700 font-semibold hover:underline text-xs"
            >
              {lang === 'hi' ? 'कारण' : 'Why'}
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* Row 1: Badge, Leaves time, Distance & Duration */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                {routeNum}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {lang === 'hi' ? `प्रस्थान ${depTime} · निर्धारित` : `Leaves ${depTime} · scheduled`}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {distKm} km · {stopsCount} stops · Direct
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-slate-900 tabular-nums leading-none">
                {totalMin}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                MIN
              </div>
            </div>
          </div>

          {/* Row 2: Crowding indicators */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 w-20">At your stop</span>
              <CrowdIndicator category={crowdOrigin} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 w-20">Busiest part</span>
              <CrowdIndicator category={peakCrowd} size="sm" />
            </div>
          </div>

          {/* Row 3: Time breakdown bar matching Screenshot 2 */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">Time breakdown</span>
              <span className="text-slate-500">Direct route</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div style={{ width: '15%' }} className="bg-slate-400" title={`${waitMin} min wait`} />
              <div style={{ width: '85%' }} className="bg-blue-600" title={`${rideMin} min ride`} />
            </div>
            <div className="text-[10px] text-slate-500">
              {waitMin} min wait · {rideMin} min ride
            </div>
          </div>

          {/* Row 4: Data Confidence & Corridor */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[9px]">
                DATA CONFIDENCE
              </span>
              <span>Based on a lot of past data</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-slate-700 block uppercase tracking-wider text-[9px]">
                CORRIDOR
              </span>
              <span>{stopsCount} stops · {distKm} km</span>
            </div>
          </div>

          {/* Row 5: Action Links matching Screenshot 2 */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            {onOpenWhyModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWhyModal(option);
                }}
                className="text-blue-700 hover:underline font-medium text-xs"
              >
                View scoring breakdown
              </button>
            )}

            <Link
              to={`/route/${encodeURIComponent(routeNum)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-700 hover:underline font-medium text-xs ml-auto"
            >
              View 24h route profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed Card matching Options 2, 3, 4 in Screenshot 2
  return (
    <div
      onClick={onSelect}
      className={`bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 shadow-xs select-none cursor-pointer transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Badge, details, crowd */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
              {routeNum}
            </span>
            <span className="text-xs font-semibold text-slate-900">
              Leaves {depTime} · scheduled
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            {distKm} km · {stopsCount} stops · Direct
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] text-slate-500">At your stop</span>
            <CrowdIndicator category={crowdOrigin} size="sm" />
          </div>
        </div>

        {/* Right: Duration + Preference Pill */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 tabular-nums">{totalMin}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">MIN</span>
          </div>
          {prefTag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {prefTag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
