import React from 'react';

export default function CorridorHeatStrip({ zones, title = "8-Zone Corridor Heat Strip", activeZoneIndex = null }) {
  // If zones array is empty or less than 8, normalize to 8 zones
  const displayZones = Array.from({ length: 8 }).map((_, idx) => {
    const existing = zones?.find((z) => z.zone_id === idx) || zones?.[idx];
    if (existing) {
      const calcLoad = existing.mean_load !== undefined ? existing.mean_load : (existing.load !== undefined ? existing.load : Math.round((existing.rci || 0) * 0.6));
      return {
        zone_id: idx,
        mean_load: calcLoad,
        rci: existing.rci !== undefined ? existing.rci : (calcLoad ? Math.min(100, calcLoad * 1.67) : 25),
        label: existing.crowd_category || (calcLoad > 35 ? 'Very crowded' : calcLoad > 20 ? 'Fairly crowded' : 'Not crowded'),
      };
    }
    // Default placeholder
    return {
      zone_id: idx,
      mean_load: 12,
      rci: 20,
      label: 'Not crowded',
    };
  });

  const getZoneColor = (rci) => {
    if (rci >= 85) return 'bg-red-500 text-white';
    if (rci >= 50) return 'bg-amber-400 text-amber-950';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{title}</span>
          <span>Origin (Zone 0) → Terminal (Zone 7)</span>
        </div>
      )}

      {/* 8-segment strip */}
      <div className="grid grid-cols-8 gap-1 p-1 bg-transit-bg rounded-[6px] border border-transit-border">
        {displayZones.map((z, idx) => {
          const isSelected = activeZoneIndex === idx;
          return (
            <div
              key={idx}
              className={`h-10 rounded-[4px] flex flex-col items-center justify-center transition-opacity cursor-pointer relative group ${getZoneColor(
                z.rci
              )} ${isSelected ? 'ring-2 ring-navy' : 'hover:opacity-90'}`}
              title={`Zone ${idx}: Load ~${Math.round(z.mean_load)} pass. | RCI ${Math.round(z.rci)} (${z.label})`}
            >
              <span className="text-[10px] font-bold opacity-80">Z{idx}</span>
              <span className="text-xs font-bold leading-none">{Math.round(z.mean_load)}</span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center px-2 py-1 bg-navy text-white text-[10px] rounded-[4px] shadow-sm whitespace-nowrap z-20 pointer-events-none">
                <span>Zone {idx} ({z.label})</span>
                <span>Load: {Math.round(z.mean_load)} | RCI: {Math.round(z.rci)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Not crowded (&lt;50)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Fairly crowded (50–85)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-red-500"></span> Very crowded (&gt;85)
        </span>
      </div>
    </div>
  );
}

