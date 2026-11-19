import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Info,
  Bus,
  RefreshCw,
  Clock,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { getOperatorActionSheet } from '../api';
import { useTranslation } from '../i18n/LanguageContext';

export default function OperatorActionSheet({
  initialDayType = 'weekday',
  initialHourStart = 6,
  initialHourEnd = 22,
  initialMinConfidence = '',
}) {
  const { t, lang } = useTranslation();

  const [dayType, setDayType] = useState(initialDayType);
  const [hourStart, setHourStart] = useState(initialHourStart);
  const [hourEnd, setHourEnd] = useState(initialHourEnd);
  const [minConfidence, setMinConfidence] = useState(initialMinConfidence);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate hour boundaries before calling
      const hStart = Math.min(hourStart, hourEnd);
      const hEnd = Math.max(hourStart, hourEnd);
      const res = await getOperatorActionSheet({
        day_type: dayType,
        hour_start: hStart,
        hour_end: hEnd,
        min_confidence: minConfidence,
      });
      if (res && res.data) {
        setData(res.data);
      } else {
        setData({ corridors: [], glossary: {}, disclaimer: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch action sheet data');
    } finally {
      setLoading(false);
    }
  }, [dayType, hourStart, hourEnd, minConfidence]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const corridors = data?.corridors || [];
  const glossary = data?.glossary || {};
  const disclaimer = data?.disclaimer || t('actionSheet.disclaimer');

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-transit-border rounded-panel p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Bus className="w-5 h-5 text-teal" />
              <span>{t('actionSheet.title', 'Corridor Action Sheet for Transit Operators')}</span>
            </h2>
            <p className="text-xs text-transit-textMuted mt-0.5">
              {t(
                'actionSheet.subtitle',
                'Hourly corridor ranking by passenger deficit to identify where additional buses are needed most'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="self-start md:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-navy font-semibold text-xs rounded-md border border-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{lang === 'hi' ? 'रीफ्रेश' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Day Type Selector */}
          <div>
            <label className="block text-[11px] font-bold text-transit-textMuted uppercase mb-1">
              {t('actionSheet.filterDayType', 'Day Type')}
            </label>
            <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 w-full">
              {[
                { val: 'weekday', label: t('actionSheet.weekday', 'Weekday') },
                { val: 'saturday', label: t('actionSheet.saturday', 'Saturday') },
                { val: 'sunday', label: t('actionSheet.sunday', 'Sunday') },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDayType(val)}
                  className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
                    dayType === val
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hour Range Start */}
          <div>
            <label className="block text-[11px] font-bold text-transit-textMuted uppercase mb-1">
              {t('actionSheet.from', 'From:')} {hourStart}:00
            </label>
            <select
              value={hourStart}
              onChange={(e) => setHourStart(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-navy focus:outline-none focus:ring-1 focus:ring-teal"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, '0')}:00 ({h % 12 || 12} {h >= 12 ? 'PM' : 'AM'})
                </option>
              ))}
            </select>
          </div>

          {/* Hour Range End */}
          <div>
            <label className="block text-[11px] font-bold text-transit-textMuted uppercase mb-1">
              {t('actionSheet.to', 'To:')} {hourEnd}:00
            </label>
            <select
              value={hourEnd}
              onChange={(e) => setHourEnd(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-navy focus:outline-none focus:ring-1 focus:ring-teal"
            >
              {Array.from({ length: 24 }).map((_, h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, '0')}:00 ({h % 12 || 12} {h >= 12 ? 'PM' : 'AM'})
                </option>
              ))}
            </select>
          </div>

          {/* Min Confidence */}
          <div>
            <label className="block text-[11px] font-bold text-transit-textMuted uppercase mb-1">
              {t('actionSheet.filterMinConfidence', 'Min Confidence')}
            </label>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-medium text-navy focus:outline-none focus:ring-1 focus:ring-teal"
            >
              <option value="">{t('actionSheet.allConfidence', 'All Tiers')}</option>
              <option value="thin">{t('actionSheet.thinConfidence', 'Thin (Any)')}</option>
              <option value="low">{t('actionSheet.lowConfidence', 'Low Data (>=10 tickets)')}</option>
              <option value="medium">{t('actionSheet.mediumConfidence', 'Medium+ (>=30 tickets)')}</option>
              <option value="high">{t('actionSheet.highConfidence', 'High Data Only (>=100 tickets)')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Indicative Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {lang === 'hi' ? 'सांकेतिक शेड्यूलिंग मॉडल: ' : 'Indicative Scheduling Model: '}
          </span>
          <span>{disclaimer}</span>
        </div>
      </div>

      {/* Action Sheet Table */}
      <div className="bg-white border border-transit-border rounded-panel shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('actionSheet.colCorridor', 'Corridor / Route')}</th>
                <th className="py-3 px-3">{t('actionSheet.colDirection', 'Direction')}</th>
                <th className="py-3 px-3">{t('actionSheet.colHour', 'Hour')}</th>
                <th className="py-3 px-3 tabular-nums">{t('actionSheet.colTrips', 'Scheduled Trips/hr')}</th>
                <th className="py-3 px-3 tabular-nums">{t('actionSheet.colTypicalLoad', 'Typical Load/Trip')}</th>
                <th className="py-3 px-3">{t('actionSheet.colVehicleClass', 'Vehicle Class')}</th>
                <th className="py-3 px-3">{t('actionSheet.colCrowdLevel', 'Crowd Level')}</th>
                <th className="py-3 px-3 tabular-nums font-bold text-red-700">
                  {t('actionSheet.colDeficit', 'Passenger Deficit')}
                </th>
                <th className="py-3 px-3 text-center bg-slate-100/70 border-x border-slate-200">
                  <div className="font-bold text-navy">
                    {t('actionSheet.colExtraTrips', 'Extra Trips (0% / 10% / 20% / 30%)')}
                  </div>
                </th>
                <th className="py-3 px-4">{t('actionSheet.colConfidence', 'Confidence')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal" />
                    <span>{lang === 'hi' ? 'एक्शन शीट डेटा लोड हो रहा है...' : 'Loading action sheet corridors...'}</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
                    <span>{error}</span>
                  </td>
                </tr>
              ) : corridors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    {lang === 'hi'
                      ? 'चयनित फिल्टर के लिए कोई कॉरिडोर नहीं मिला।'
                      : 'No corridor deficits found matching the selected filters.'}
                  </td>
                </tr>
              ) : (
                corridors.map((c, idx) => {
                  const hasDeficit = Number(c.passenger_deficit) > 0;
                  const extra0 = c.extra_trips?.['0%'] ?? 0;
                  const extra10 = c.extra_trips?.['10%'] ?? 0;
                  const extra20 = c.extra_trips?.['20%'] ?? 0;
                  const extra30 = c.extra_trips?.['30%'] ?? 0;

                  return (
                    <tr
                      key={`${c.route_id}-${c.direction}-${c.hour}-${idx}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Corridor & Route */}
                      <td className="py-3 px-4 font-bold text-navy whitespace-nowrap">
                        <Link
                          to={`/route/${encodeURIComponent(c.route_id)}`}
                          className="hover:text-teal underline underline-offset-2 flex items-center gap-1.5"
                        >
                          <span className="px-2 py-0.5 rounded bg-navy text-white text-[11px] font-black">
                            {c.route_id}
                          </span>
                        </Link>
                      </td>

                      {/* Direction */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {c.direction}
                        </span>
                      </td>

                      {/* Hour */}
                      <td className="py-3 px-3 tabular-nums font-semibold text-slate-700">
                        {String(c.hour).padStart(2, '0')}:00
                      </td>

                      {/* Scheduled Trips */}
                      <td className="py-3 px-3 tabular-nums text-slate-700 font-medium">
                        {c.scheduled_trips_per_hour} trips/hr
                      </td>

                      {/* Typical Load */}
                      <td className="py-3 px-3 tabular-nums text-slate-900 font-bold">
                        {c.typical_load_per_trip} pax
                      </td>

                      {/* Vehicle Class & Nominal Capacity Badge (Invariant: Hide unverified % occupancy) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-800 text-[11px]">
                            {c.vehicle_class}
                          </span>
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200"
                            title="Nominal design capacity (capacity_verified: false). Unverified occupancy % hidden."
                          >
                            Nominal: {c.nominal_capacity} cap
                          </span>
                        </div>
                      </td>

                      {/* Crowd Level Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.crowd_level === 'Crowded'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : c.crowd_level === 'Standing Room'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {c.crowd_level}
                        </span>
                      </td>

                      {/* Passenger Deficit */}
                      <td className="py-3 px-3 tabular-nums font-black whitespace-nowrap">
                        {hasDeficit ? (
                          <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold">
                            +{c.passenger_deficit} pax/hr
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0</span>
                        )}
                      </td>

                      {/* Extra Trips across 4 scenarios (0%, 10%, 20%, 30%) */}
                      <td className="py-3 px-3 bg-slate-50/60 border-x border-slate-200 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              extra0 > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="Baseline 0% unrecorded"
                          >
                            0%: +{extra0}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              extra10 > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="+10% unrecorded"
                          >
                            10%: +{extra10}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              extra20 > 0 ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="+20% unrecorded"
                          >
                            20%: +{extra20}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              extra30 > 0 ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-slate-100 text-slate-400'
                            }`}
                            title="+30% unrecorded (Pink Pass)"
                          >
                            30%: +{extra30}
                          </span>
                        </div>
                      </td>

                      {/* Confidence & Sample Ticket Count */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 text-[11px]">
                            {c.confidence_text || c.confidence}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {c.sample_ticket_count} {t('actionSheet.colSampleCount', 'ETM Samples')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plain Language Glossary Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
        <h3 className="font-bold text-navy flex items-center gap-1.5 text-sm">
          <Info className="w-4 h-4 text-teal" />
          <span>{lang === 'hi' ? 'शब्दावली और संकेतक' : 'Plain-Language Glossary'}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3 rounded-lg border border-slate-200/80">
            <span className="font-bold text-navy block text-xs mb-0.5">
              {t('actionSheet.glossaryDeficitTitle', 'Passenger Deficit')}
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {glossary.passenger_deficit ||
                t(
                  'actionSheet.glossaryDeficitDesc',
                  'Hourly unaccommodated passenger demand above nominal bus capacity across scheduled departures.'
                )}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200/80">
            <span className="font-bold text-navy block text-xs mb-0.5">
              {t('actionSheet.glossaryExtraTripsTitle', 'Indicative Additional Trips')}
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {glossary.extra_trips ||
                t(
                  'actionSheet.glossaryExtraTripsDesc',
                  'Number of extra bus departures per hour required to bring average passenger load below capacity under each unrecorded rider scenario.'
                )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
