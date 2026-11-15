import React from 'react';
import { ArrowRight, HelpCircle, ChevronRight, BarChart2, Database } from 'lucide-react';
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

  // Render Expanded Card if Selected (matching Stitch Active Option Card)
  if (isSelected) {
    return (
      <div
        onClick={onSelect}
        className={`bg-white border-2 border-[#145c3a] rounded-xl shadow-md overflow-hidden select-none cursor-pointer transition-all ${className}`}
      >
        {/* Top Header inside card: "Recommended for fastest" */}
        <div className="bg-[#e9f7ee] border-b border-[#d8e6dd] px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-bold text-[#145c3a]">
            {preference === 'least_crowded'
              ? (lang === 'hi' ? 'कम भीड़ के लिए अनुशंसित' : 'Recommended for least crowded')
              : preference === 'balanced'
              ? (lang === 'hi' ? 'संतुलित यात्रा के लिए अनुशंसित' : 'Recommended for balanced route')
              : (lang === 'hi' ? 'सबसे तेज़ यात्रा (अनुशंसित)' : 'Recommended for fastest')}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3.5">
          {/* Row 1: Badge, Leaves time, Distance & Duration */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="bg-[#004327] text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                {routeNum}
              </span>
              <div>
                <p className="text-xs font-bold text-[#121e19]">
                  {lang === 'hi' ? `प्रस्थान ${depTime} · निर्धारित` : `Leaves ${depTime} · scheduled`}
                </p>
                <p className="text-[11px] text-[#404942] mt-0.5">
                  {distKm} km · {stopsCount} stops · Direct
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-[#121e19] tabular-nums leading-none">
                {totalMin}
              </div>
              <div className="text-[10px] font-bold text-[#707971] uppercase tracking-wider mt-0.5">
                MIN
              </div>
            </div>
          </div>

          {/* Row 2: Crowding indicators */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#404942] w-20">At your stop</span>
              <CrowdIndicator category={crowdOrigin} size="sm" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#404942] w-20">Busiest part</span>
              <CrowdIndicator category={peakCrowd} size="sm" />
            </div>
          </div>

          {/* Row 3: Time breakdown bar matching Stitch */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#121e19] font-semibold">Time breakdown</span>
              <span className="text-[#136c46] font-semibold">Direct route</span>
            </div>
            <div className="h-2 w-full bg-[#d8e6dd] rounded-full overflow-hidden flex">
              <div style={{ width: '12%' }} className="bg-[#bfc9c0]" title={`${waitMin} min wait`} />
              <div style={{ width: '88%' }} className="bg-[#004327]" title={`${rideMin} min ride`} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#707971]">
              <span>{waitMin} min wait</span>
              <span>{rideMin} min ride</span>
            </div>
          </div>

          {/* Row 4: Data Confidence & Corridor */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#404942] pt-2 border-t border-[#d8e6dd]">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#136c46]" />
              <span>High historical confidence</span>
            </div>
            <div className="text-right">
              <span>Corridor: {stopsCount} stops · {distKm} km</span>
            </div>
          </div>

          {/* Row 5: Action Link */}
          <div className="flex items-center justify-end pt-2 border-t border-[#d8e6dd] text-xs">
            <Link
              to={`/route/${encodeURIComponent(routeNum)}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#004327] hover:underline font-semibold text-xs flex items-center gap-1"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>View 24h route profile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Collapsed Card (matching Stitch Options 2, 3, 4)
  return (
    <div
      onClick={onSelect}
      className={`bg-white border border-[#d8e6dd] hover:border-[#136c46]/60 rounded-xl p-3.5 sm:p-4 shadow-xs select-none cursor-pointer transition-all hover:bg-[#e9f7ee]/30 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Badge, details, crowd */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-[#27332d] text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded">
              {routeNum}
            </span>
            <span className="text-xs font-bold text-[#121e19]">
              Leaves {depTime} · scheduled
            </span>
          </div>

          <div className="text-[11px] text-[#404942]">
            {distKm} km · {stopsCount} stops · Direct
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] text-[#707971]">At your stop:</span>
            <CrowdIndicator category={crowdOrigin} size="sm" />
          </div>
        </div>

        {/* Right: Duration + Preference Pill */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#121e19] tabular-nums leading-none">{totalMin}</span>
            <span className="text-[10px] font-bold text-[#707971] uppercase">MIN</span>
          </div>
          {prefTag && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              prefTag === 'Least crowded'
                ? 'bg-[#a2f4c3] text-[#005232]'
                : 'bg-[#e3f1e8] text-[#404942]'
            }`}>
              {prefTag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
