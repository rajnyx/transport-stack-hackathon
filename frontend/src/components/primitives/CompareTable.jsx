import React from 'react';
import RouteBadge from './RouteBadge';
import CrowdIndicator from './CrowdIndicator';
import { useTranslation } from '../../i18n/LanguageContext';

export default function CompareTable({
  options = [],
  selectedOptionIndex = 0,
  onSelectOption,
  className = '',
}) {
  const { t, lang } = useTranslation();

  if (!options || options.length === 0) return null;

  const topOptions = options.slice(0, 3);

  const getOptTotalTime = (opt) =>
    opt?.timing?.total_duration_min ?? opt?.total_time_min ?? opt?.total_duration_minutes ?? 999;
  const getOptRci = (opt) =>
    opt?.crowding?.journey_rci ?? opt?.rci ?? opt?.avg_rci ?? 50;

  // Identify fastest and least crowded among top options
  const fastestIndex = topOptions.reduce(
    (minIdx, cur, idx, arr) =>
      getOptTotalTime(cur) < getOptTotalTime(arr[minIdx]) ? idx : minIdx,
    0
  );

  const leastCrowdedIndex = topOptions.reduce(
    (minIdx, cur, idx, arr) =>
      getOptRci(cur) < getOptRci(arr[minIdx]) ? idx : minIdx,
    0
  );

  const getConfidenceWord = (conf) => {
    const c = String(conf || '').toLowerCase();
    if (c === 'high') return lang === 'hi' ? 'उच्च' : 'A lot of data';
    if (c === 'medium') return lang === 'hi' ? 'मध्यम' : 'Some data';
    return lang === 'hi' ? 'कम' : 'Little data';
  };

  const getBusiestZone = (opt) => {
    const zones = opt?.crowding?.zone_breakdown || opt?.zone_forecasts;
    if (zones && zones.length > 0) {
      const maxZone = [...zones].sort((a, b) => (b.rci || 0) - (a.rci || 0))[0];
      return maxZone?.zone_name || `Zone ${maxZone?.zone_id ?? 'Central'}`;
    }
    return lang === 'hi' ? 'सामान्य कॉरिडोर' : 'Typical stretch';
  };

  const metrics = [
    {
      key: 'total_time',
      label: lang === 'hi' ? 'कुल समय' : 'Total time',
      render: (opt) => {
        const val = getOptTotalTime(opt);
        return (
          <span className="font-bold text-navy text-sm tabular-nums">
            {val !== 999 ? Math.round(val) : '—'} {t('results.min')}
          </span>
        );
      },
    },
    {
      key: 'walk',
      label: lang === 'hi' ? 'पैदल' : 'Walk',
      render: (opt) => (
        <span className="tabular-nums text-tx-muted">
          {Math.round(opt.timing?.walk_time_min ?? opt.walk_time_minutes ?? 0)} {t('results.min')}
        </span>
      ),
    },
    {
      key: 'wait',
      label: lang === 'hi' ? 'इंतज़ार' : 'Wait',
      render: (opt) => (
        <span className="tabular-nums text-tx-muted">
          {Math.round(opt.timing?.wait_time_min ?? opt.wait_time_min ?? opt.wait_time_minutes ?? 0)} {t('results.min')}
        </span>
      ),
    },
    {
      key: 'ride',
      label: lang === 'hi' ? 'सवारी' : 'Ride',
      render: (opt) => (
        <span className="tabular-nums font-medium text-navy">
          {Math.round(opt.timing?.travel_time_min ?? opt.timing?.in_vehicle_min ?? opt.travel_time_min ?? opt.ride_time_minutes ?? getOptTotalTime(opt))} {t('results.min')}
        </span>
      ),
    },
    {
      key: 'speed',
      label: lang === 'hi' ? 'अनुमानित गति' : 'Approx speed',
      render: (opt) => {
        const dist = Number(opt.distance_km ?? opt.timing?.distance_km ?? 12.0);
        const rideMin = Math.round(opt.timing?.travel_time_min ?? opt.timing?.in_vehicle_min ?? opt.travel_time_min ?? opt.ride_time_minutes ?? getOptTotalTime(opt));
        const spd = opt.approx_speed_kmh ?? (dist > 0 && rideMin > 0 ? Math.round((dist * 60) / rideMin) : 20);
        return (
          <span className="tabular-nums font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs">
            ~{spd} km/h
          </span>
        );
      },
    },
    {
      key: 'crowd_origin',
      label: lang === 'hi' ? 'आपके स्टॉप पर भीड़' : 'Crowd at your stop',
      render: (opt) => (
        <CrowdIndicator
          category={opt.crowding?.category || opt.crowding_category || opt.crowd_category || 'unknown'}
          size="sm"
        />
      ),
    },
    {
      key: 'busiest',
      label: lang === 'hi' ? 'सबसे व्यस्त हिस्सा' : 'Busiest part of ride',
      render: (opt) => (
        <span className="text-xs text-tx truncate block max-w-[130px] mx-auto">
          {getBusiestZone(opt)}
        </span>
      ),
    },
    {
      key: 'confidence',
      label: lang === 'hi' ? 'डेटा विश्वसनीयता' : 'Data confidence',
      render: (opt) => (
        <span className="text-xs text-tx-muted font-medium">
          {getConfidenceWord(opt.confidence)}
        </span>
      ),
    },
    {
      key: 'transfers',
      label: lang === 'hi' ? 'ट्रांसफर (बदलना)' : 'Transfers',
      render: (opt) => (
        <span className="text-xs font-semibold text-navy">
          {opt.transfers ? `${opt.transfers}` : (lang === 'hi' ? 'सीधी बस (0)' : 'Direct bus (0)')}
        </span>
      ),
    },
  ];

  return (
    <div className={`border border-border rounded-2xl bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="p-3.5 bg-[#F8F5F2] border-b border-border flex items-center justify-between">
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
          {lang === 'hi' ? 'शीर्ष 3 विकल्पों की तुलना' : 'Compare Top 3 Options'}
        </h4>
        <span className="text-[11px] text-tx-muted font-medium">
          {topOptions.length} {lang === 'hi' ? 'विकल्प' : 'options'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-white">
              <th className="py-2.5 px-3 font-semibold text-tx-muted sticky left-0 bg-white z-10 min-w-[110px] sm:min-w-[130px] border-r border-border/50">
                {lang === 'hi' ? 'मापदंड' : 'Metric'}
              </th>
              {topOptions.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const routeNum = opt.route_short_name || opt.route_id;
                const isFastest = idx === fastestIndex;
                const isLeastCrowded = idx === leastCrowdedIndex && !isFastest;

                return (
                  <th
                    key={opt.trip_id || idx}
                    onClick={() => onSelectOption && onSelectOption(idx)}
                    className={`py-2.5 px-3 text-center cursor-pointer min-w-[120px] transition-colors ${
                      isSelected ? 'bg-[#004327]/10 font-bold text-[#004327]' : 'hover:bg-surface-bg text-[#004327]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {isFastest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#004327] text-white leading-none">
                          {lang === 'hi' ? 'सबसे तेज़' : 'Fastest'}
                        </span>
                      )}
                      {isLeastCrowded && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#136c46] text-white leading-none">
                          {lang === 'hi' ? 'सीट उपलब्ध' : 'Seat available'}
                        </span>
                      )}
                      <RouteBadge routeNumber={routeNum} size="sm" />
                      <span className="text-[11px] block text-tx-muted font-medium">
                        {lang === 'hi' ? `विकल्प ${idx + 1}` : `Option ${idx + 1}`}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {metrics.map((m) => (
              <tr key={m.key} className="hover:bg-surface-bg/40 transition-colors">
                <td className="py-2.5 px-3 font-medium text-navy sticky left-0 bg-surface z-10 border-r border-border/50">
                  {m.label}
                </td>
                {topOptions.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <td
                      key={opt.trip_id || idx}
                      onClick={() => onSelectOption && onSelectOption(idx)}
                      className={`py-2.5 px-3 text-center cursor-pointer ${
                        isSelected ? 'bg-teal/5 font-semibold' : ''
                      }`}
                    >
                      {m.render(opt)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
