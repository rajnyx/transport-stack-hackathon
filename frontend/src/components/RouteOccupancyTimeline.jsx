import React from 'react';
import CrowdIndicator, { normalizeCrowdCategory } from './primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * RouteOccupancyTimeline
 * Displays an origin-to-destination corridor segmented bar divided into
 * Green (Low), Yellow/Amber (Moderate), and Red (High) crowding segments,
 * along with the selected departure time and crowd level.
 */
export default function RouteOccupancyTimeline({ option, departureTime = '18:00', className = '' }) {
  const { lang } = useTranslation();
  if (!option) return null;

  const zones = option.crowding?.zone_breakdown || [];
  const routeNum = option.route_short_name || option.route_id || 'Route';
  const depTime = option.scheduled_departure ? option.scheduled_departure.slice(0, 5) : departureTime;
  const overallCategory = option.crowding?.category || option.crowding_category || option.crowd_category || 'moderate';
  const normOverall = normalizeCrowdCategory(overallCategory);

  // If zone breakdown is provided by API, build segments; otherwise, generate typical 3-5 corridor zones
  const segments = zones.length > 0
    ? zones.map((z, idx) => {
        const cat = normalizeCrowdCategory(z.category || (z.rci > 70 ? 'high' : z.rci > 40 ? 'moderate' : 'low'));
        return {
          id: z.zone_id ?? idx,
          name: z.zone_name || `Zone ${idx + 1}`,
          category: cat,
          rci: Math.round(z.rci || 50),
        };
      })
    : [
        { id: 1, name: 'Origin Zone', category: normOverall === 'high' ? 'moderate' : 'low', rci: 35 },
        { id: 2, name: 'Midway Radial Trunk', category: normOverall === 'high' ? 'high' : 'moderate', rci: 75 },
        { id: 3, name: 'Destination Zone', category: normOverall === 'high' ? 'moderate' : 'low', rci: 42 },
      ];

  const getSegmentColor = (cat) => {
    if (cat === 'high') return 'bg-crowd-high';
    if (cat === 'moderate') return 'bg-crowd-mod';
    return 'bg-crowd-low';
  };

  const getSegmentBorder = (cat) => {
    if (cat === 'high') return 'border-red-400';
    if (cat === 'moderate') return 'border-amber-400';
    return 'border-emerald-400';
  };

  return (
    <div className={`bg-white border border-border rounded-2xl p-4 shadow-sm space-y-3 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-transit-borderSubtle pb-2.5">
        <div>
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
            {lang === 'hi' ? 'रूट यात्रा भीड़ समयरेखा (Origin → Destination)' : 'Route Occupancy Timeline'}
          </h3>
          <p className="text-[11px] text-transit-textMuted mt-0.5">
            {lang === 'hi'
              ? `प्रस्थान ~${depTime} · स्टॉप-दर-स्टॉप लोड मॉडल`
              : `Selected departure: ~${depTime} · Segment-by-segment load`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CrowdIndicator category={overallCategory} size="sm" showLabel={true} />
        </div>
      </div>

      {/* Segmented Timeline Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-100 p-0.5 gap-0.5">
          {segments.map((seg, idx) => (
            <div
              key={seg.id || idx}
              style={{ flex: 1 }}
              className={`h-full rounded-full transition-all ${getSegmentColor(seg.category)}`}
              title={`${seg.name}: ${seg.category} crowding (~${seg.rci} RCI)`}
            />
          ))}
        </div>

        {/* Origin / Stretch / Destination Labels */}
        <div className="flex items-center justify-between text-[11px] text-transit-textMuted pt-0.5">
          <span className="font-semibold text-navy truncate max-w-[140px]">
            {option.origin_stop?.name || (lang === 'hi' ? 'प्रस्थान स्टॉप' : 'Origin')}
          </span>
          <span className="text-[10px] text-teal font-medium uppercase tracking-wider">
            {segments.length} {lang === 'hi' ? 'कॉरिडोर ज़ोन' : 'Corridor Zones'}
          </span>
          <span className="font-semibold text-navy truncate max-w-[140px] text-right">
            {option.destination_stop?.name || (lang === 'hi' ? 'गंतव्य स्टॉप' : 'Destination')}
          </span>
        </div>
      </div>

      {/* Mini Color Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-transit-textMuted pt-1 border-t border-transit-borderSubtle">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-crowd-low" />
          <span>{lang === 'hi' ? 'कम भीड़ (सीट उपलब्ध)' : 'Low (<40)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-crowd-mod" />
          <span>{lang === 'hi' ? 'मध्यम (खड़े होने की जगह)' : 'Moderate (40–70)'}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-crowd-high" />
          <span>{lang === 'hi' ? 'अत्यधिक भीड़' : 'High (>70)'}</span>
        </span>
      </div>
    </div>
  );
}
