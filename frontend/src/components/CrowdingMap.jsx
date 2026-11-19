import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  Info,
  ExternalLink,
  MapPin,
  Sliders,
} from 'lucide-react';
import { getCorridorsMap } from '../api';
import { useTranslation } from '../i18n/LanguageContext';

// Reliable invalidation & view fitting on map mount or tab activation
function InvalidateAndFit({ bounds }) {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      try {
        map.invalidateSize();
        if (bounds && bounds.length > 1) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
        }
      } catch (e) {
        // Guard against race conditions on unmount
      }
    };

    handleResize();
    const t1 = setTimeout(handleResize, 150);
    const t2 = setTimeout(handleResize, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, bounds]);

  return null;
}

export default function CrowdingMap({
  initialHour = 8,
  initialDayType = 'weekday',
  height = '560px',
  className = '',
}) {
  const { t, lang } = useTranslation();

  const [hour, setHour] = useState(initialHour);
  const [dayType, setDayType] = useState(initialDayType);
  const [corridors, setCorridors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCorridors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCorridorsMap({
        hour,
        day_type: dayType,
        limit: 50,
      });
      if (res && res.data) {
        setCorridors(res.data);
      } else {
        setCorridors([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load corridor map data');
    } finally {
      setLoading(false);
    }
  }, [hour, dayType]);

  useEffect(() => {
    fetchCorridors();
  }, [fetchCorridors]);

  // Compute all points to bound map if available
  const allBounds = useMemo(() => {
    const pts = [];
    corridors.forEach((c) => {
      if (Array.isArray(c.coordinates)) {
        c.coordinates.forEach((pt) => {
          if (Array.isArray(pt) && pt.length >= 2) {
            pts.push([pt[0], pt[1]]);
          }
        });
      }
    });
    return pts;
  }, [corridors]);

  const defaultCenter = [28.6139, 77.2090]; // Delhi NCR

  const getCorridorColor = (c) => {
    if (c.color) return c.color;
    if (c.crowd_level === 'Crowded') return '#E5484D';
    if (c.crowd_level === 'Standing Room') return '#F5A623';
    return '#22A06B';
  };

  const getCrowdBadgeClass = (level) => {
    if (level === 'Crowded') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'Standing Room') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Bar */}
      <div className="bg-white border border-transit-border rounded-panel p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-navy flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal" />
              <span>{t('crowdingMap.title', 'Planners Network Crowding Map')}</span>
            </h2>
            <p className="text-xs text-transit-textMuted mt-0.5">
              {t(
                'crowdingMap.subtitle',
                'Delhi trunk corridors colored by typical crowdedness level for selected hour and day type'
              )}
            </p>
          </div>

          {/* Capped Notice Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold self-start sm:self-auto">
            <Info className="w-3.5 h-3.5 text-teal shrink-0" />
            <span>{t('crowdingMap.cappedNotice', 'Capped to top 50 corridors for smooth rendering')}</span>
          </div>
        </div>

        {/* Filters and Scrubber Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-100">
          {/* Day Type Selector (4 cols) */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
              {t('crowdingMap.selectDayType', 'Day Type')}:
            </span>
            <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 flex-1">
              <button
                type="button"
                onClick={() => setDayType('weekday')}
                className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
                  dayType === 'weekday'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {t('crowdingMap.weekday', 'Weekday')}
              </button>
              <button
                type="button"
                onClick={() => setDayType('weekend')}
                className={`flex-1 py-1 text-xs font-semibold rounded transition-colors ${
                  dayType === 'weekend'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {t('crowdingMap.weekend', 'Weekend')}
              </button>
            </div>
          </div>

          {/* Hour Scrubber Slider & Quick Presets (8 cols) */}
          <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Clock className="w-4 h-4 text-teal shrink-0" />
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                {String(hour).padStart(2, '0')}:00 ({hour % 12 || 12} {hour >= 12 ? 'PM' : 'AM'})
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="23"
              step="1"
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              aria-label="Hour Scrubber"
              className="w-full accent-teal h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: '8 AM', h: 8 },
                { label: '1 PM', h: 13 },
                { label: '6 PM', h: 18 },
                { label: '2 AM', h: 2 },
              ].map((p) => (
                <button
                  key={p.h}
                  type="button"
                  onClick={() => setHour(p.h)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                    hour === p.h
                      ? 'bg-teal text-white border-teal shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        style={{ height }}
        className="w-full relative rounded-panel border border-transit-border overflow-hidden shadow-xs bg-slate-100 z-0"
      >
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border border-slate-200">
              <RefreshCw className="w-4 h-4 animate-spin text-teal" />
              <span className="text-xs font-semibold text-navy">
                {t('crowdingMap.loadingMap', 'Loading corridor polylines...')}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-xs text-red-700 shadow-md">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <InvalidateAndFit bounds={allBounds} />

          {corridors.map((c) => {
            const coords = Array.isArray(c.coordinates) ? c.coordinates : [];
            if (coords.length < 2) return null;
            const lineColor = getCorridorColor(c);

            return (
              <Polyline
                key={c.corridor_id || c.route_id}
                positions={coords}
                pathOptions={{
                  color: lineColor,
                  weight: 5,
                  opacity: 0.85,
                  lineJoin: 'round',
                  lineCap: 'round',
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs min-w-[170px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-bold text-navy text-sm">
                        {c.route_short_name || c.route_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCrowdBadgeClass(
                          c.crowd_level
                        )}`}
                      >
                        {c.crowd_level}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div>
                        <span className="text-slate-400">Typical Load: </span>
                        <span className="font-bold text-slate-800">{c.typical_load || '—'} pax</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Scheduled: </span>
                        <span className="font-bold text-slate-800">{c.trips_per_hour || 1} trips/hr</span>
                      </div>
                      {c.rci !== undefined && (
                        <div>
                          <span className="text-slate-400">Crowd Index (RCI): </span>
                          <span className="font-bold text-slate-800">{c.rci} / 100</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <Link
                        to={`/route/${encodeURIComponent(c.route_id)}`}
                        className="text-teal hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>{lang === 'hi' ? 'रूट विवरण देखें' : 'View Route Details'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend Bar */}
      <div className="bg-white border border-transit-border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 shadow-2xs gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-navy text-[11px] uppercase tracking-wider">
            {lang === 'hi' ? 'भीड़ स्तर संकेतक:' : 'Crowd Legend:'}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-4 h-1.5 rounded-full bg-[#22A06B]" />
            <span>{t('crowdingMap.legendLow', 'Seats Available')}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-4 h-1.5 rounded-full bg-[#F5A623]" />
            <span>{t('crowdingMap.legendModerate', 'Standing Room')}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-4 h-1.5 rounded-full bg-[#E5484D]" />
            <span>{t('crowdingMap.legendHigh', 'Crowded')}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          <span>{t('crowdingMap.osmNotice', 'Base map data: OpenStreetMap contributors')}</span>
        </div>
      </div>
    </div>
  );
}
