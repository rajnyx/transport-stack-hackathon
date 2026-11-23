import React from 'react';
import { ArrowRight, HelpCircle, ChevronRight, BarChart2, Database, AlertCircle, Footprints } from 'lucide-react';
import { Link } from 'react-router-dom';
import RouteBadge from './RouteBadge';
import CrowdIndicator from './CrowdIndicator';
import { useTranslation } from '../../i18n/LanguageContext';
import { formatTime12h, formatConfidence, canonicalCrowdLevel } from '../../utils/formatters';

export default function TransitRow({
  option,
  isRecommended = false,
  isSelected = false,
  preference = 'fastest',
  onSelect,
  className = '',
}) {
  const { t, lang } = useTranslation();

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
  const rawDep = option.scheduled_departure ? option.scheduled_departure.slice(0, 5) : '18:00';
  const depTime = formatTime12h(rawDep);
  const distKm = option.distance_km ?? option.timing?.distance_km ?? 13.4;
  const stopsCount = option.stops_count ?? option.stops?.length ?? 25;
  const inVehMin = option.timing?.in_vehicle_min ?? option.timing?.travel_time_min ?? option.travel_time_min ?? totalMin;
  const approxSpeed = option.approx_speed_kmh ?? (distKm > 0 && inVehMin > 0 ? Math.round((Number(distKm) * 60) / inVehMin) : 20);

  const isAc = option.vehicle_class === 'AC' || option.is_ac === true;
  const vehicleClassLabel = isAc ? t('vehicleClass.ac', 'AC Bus') : t('vehicleClass.nonAc', 'Standard Bus');

  const hasBoardingAdvice = option.boarding_advice && option.boarding_advice.show_advice === true;

  const isThinData = option.confidence === 'none' || option.confidence === 'thin' || option.thin_data;

  const crowdOrigin = isThinData
    ? 'unknown'
    : canonicalCrowdLevel(
        option.crowding?.category ||
        option.crowding_category ||
        option.crowd_category
      );

  const peakCrowd = isThinData
    ? 'unknown'
    : canonicalCrowdLevel(
        option.peak_crowd_category ||
        option.crowding?.crowding_label ||
        crowdOrigin
      );

  const rciVal = Math.round(
    option.crowding?.peak_rci ??
    option.crowding?.journey_rci ??
    option.peak_rci ??
    option.rci ??
    option.avg_rci ??
    (peakCrowd === 'high' ? 88 : peakCrowd === 'moderate' ? 62 : 8)
  );

  const prefTag =
    preference === 'least_crowded'
      ? (lang === 'hi' ? 'सीट उपलब्धता के लिए अनुशंसित' : 'Recommended for seat availability')
      : preference === 'balanced'
      ? (lang === 'hi' ? 'संतुलित विकल्प' : 'Recommended for balanced')
      : (lang === 'hi' ? 'सबसे तेज़ विकल्प' : 'Recommended for fastest');

  // Render Expanded Card if Selected (matching Stitch Active Option Card)
  if (isSelected) {
    return (
      <div
        onClick={onSelect}
        className={`bg-white border-2 border-[#145c3a] rounded-xl shadow-md overflow-hidden select-none cursor-pointer transition-all ${className}`}
      >
        {/* Top Header inside card */}
        <div className="bg-[#e9f7ee] border-b border-[#d8e6dd] px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-bold text-[#145c3a]">
            {prefTag}
          </span>
          {hasBoardingAdvice && (
            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Footprints className="w-3 h-3" />
              {t('boardingAdvice.walkBadge', 'Walking Alternative Available')}
            </span>
          )}
        </div>

        <div className="p-4 space-y-3.5">
          {/* Row 1: Badge, Leaves time, Distance & Duration */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col gap-1">
                <span className="bg-[#004327] text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-xs">
                  {routeNum}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded text-center ${
                  isAc ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-700'
                }`}>
                  {isAc ? 'AC' : 'Non-AC'}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#121e19]">
                  {lang === 'hi' ? `प्रस्थान ${depTime} · निर्धारित` : `Leaves ${depTime} · scheduled`}
                </p>
                <p className="text-[11px] text-[#404942] mt-0.5">
                  {distKm} km · ~{approxSpeed} km/h · {stopsCount} stops · {vehicleClassLabel} · Direct
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-[#121e19] tabular-nums leading-none">
                {totalMin}
              </div>
              <div className="text-[10px] font-bold text-[#707971] uppercase tracking-wider mt-0.5">
                MIN TOTAL
              </div>
            </div>
          </div>

          {/* Row 2: At your stop vs Busiest stretch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#e9f7ee]/50 border border-[#d8e6dd]/60">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-[#404942] w-20">At your stop</span>
              {isThinData ? (
                <span className="text-xs text-[#707971] bg-[#d8e6dd] px-1.5 py-0.5 rounded">Not enough data</span>
              ) : (
                <CrowdIndicator category={crowdOrigin} size="sm" />
              )}
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-[#404942] w-20">Busiest part</span>
                {isThinData ? (
                  <span className="text-xs text-[#707971] bg-[#d8e6dd] px-1.5 py-0.5 rounded">Not enough data</span>
                ) : (
                  <CrowdIndicator category={peakCrowd} size="sm" />
                )}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                rciVal >= 75
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : rciVal >= 45
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                RCI {rciVal}
              </span>
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

          {/* Row 4: Data Confidence */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#404942] pt-2 border-t border-[#d8e6dd]">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#136c46]" />
              <span className="font-medium text-[#121e19]">
                {option.confidence_text || formatConfidence(option.confidence, option.sample_ticket_count)}
                {option.sample_ticket_count !== undefined && (
                  <span className="text-[#707971] ml-1">
                    ({option.sample_ticket_count} {lang === 'hi' ? 'टिकट' : 'tickets'})
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span>Corridor: {stopsCount} stops · {distKm} km · ~{approxSpeed} km/h</span>
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
              <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#27332d] text-white font-bold text-xs px-2.5 py-0.5 rounded">
              {routeNum}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              isAc ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-700'
            }`}>
              {isAc ? 'AC' : 'Non-AC'}
            </span>
            <span className="text-xs font-bold text-[#121e19]">
              Leaves {depTime} · scheduled
            </span>
            {hasBoardingAdvice && (
              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Footprints className="w-2.5 h-2.5" />
                Walk
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#404942]">
            {distKm} km · ~{approxSpeed} km/h · {stopsCount} stops · {vehicleClassLabel} · Direct
          </div>

          <div className="flex items-center gap-3 pt-0.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#707971]">At your stop:</span>
              {isThinData ? (
                <span className="text-xs text-[#707971] bg-[#d8e6dd] px-1.5 py-0.5 rounded">Not enough data</span>
              ) : (
                <CrowdIndicator category={crowdOrigin} size="sm" />
              )}
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              rciVal >= 75
                ? 'bg-red-50 text-red-700 border-red-200'
                : rciVal >= 45
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              RCI {rciVal}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#707971]">
              <Database className="w-3 h-3 text-[#136c46]" />
              <span>
                {option.confidence_text || formatConfidence(option.confidence, option.sample_ticket_count)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Duration */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#121e19] tabular-nums leading-none">{totalMin}</span>
            <span className="text-[10px] font-bold text-[#707971] uppercase">MIN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
