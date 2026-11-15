import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, Search, X, Sparkles, Building2 } from 'lucide-react';
import { searchStops, getSuggestedStops } from '../../api';

const DEFAULT_POPULAR_HUBS = [
  { stop_id: '5694', stop_name: 'Anand Vihar ISBT', stop_code: 'AV01', hub_category: 'East Delhi Inter-State Hub' },
  { stop_id: '5100', stop_name: 'Shivaji Stadium Terminal ( Connaught Place )', stop_code: 'CP01', hub_category: 'Central Hub / Connaught Place' },
  { stop_id: '1025', stop_name: 'Kashmere Gate City Bus Terminal', stop_code: 'KG01', hub_category: 'North Delhi Inter-State Hub' },
  { stop_id: '2829', stop_name: 'AIIMS New Delhi', stop_code: 'AI01', hub_category: 'South Delhi Medical Hub' },
  { stop_id: '3102', stop_name: 'Dhaula Kuan', stop_code: 'DK01', hub_category: 'South-West Interchange' },
  { stop_id: '2325', stop_name: 'Sarai Kale Khan ISBT', stop_code: 'SK01', hub_category: 'South-East Inter-State Hub' },
  { stop_id: '2559', stop_name: 'Nehru Place', stop_code: 'NP01', hub_category: 'South Commercial Hub' },
  { stop_id: '1325', stop_name: 'Karol Bagh Terminal', stop_code: 'KB01', hub_category: 'West Transit Terminal' },
];

/**
 * StopCombobox — High-performance accessible Transit Stop Picker
 * - Shows Recent Searches & Nearby on explicit tap
 * - 150ms debounced search with request cancellation
 * - Full ARIA combobox pattern with keyboard navigation
 * - Highlighted character matching
 */
export default function StopCombobox({
  id,
  label,
  value,
  selectedStop,
  onChange,
  onSelectStop,
  placeholder,
  required = false,
  error,
  recentSearches = [],
  onClearRecent,
  t,
  className = '',
}) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [suggestedHubs, setSuggestedHubs] = useState(DEFAULT_POPULAR_HUBS);
  const [locLoading, setLocLoading] = useState(false);
  const [locMessage, setLocMessage] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync internal query with external value prop
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Load backend popular hubs on mount
  useEffect(() => {
    getSuggestedStops(8).then((hubs) => {
      if (Array.isArray(hubs) && hubs.length > 0) {
        setSuggestedHubs(hubs);
      }
    }).catch(() => {});
  }, []);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced stop search with abort controller (starts at 1 char)
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await searchStops(query.trim(), 8);
        setResults(matches || []);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Stop search failed:', err);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 160);

    return () => clearTimeout(timer);
  }, [query]);

  // Geolocation trigger on explicit user tap
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocMessage(t ? t('planner.locationUnavailable') : 'Location unavailable');
      return;
    }
    setLocLoading(true);
    setLocMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/stops/nearby?lat=${lat}&lon=${lon}&radius_km=1.5&limit=4`);
          const data = await res.json();
          if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
            setNearbyStops(data.data);
          } else {
            setLocMessage(t ? t('planner.noStopsFound') : 'No stops found within 1.5 km');
          }
        } catch {
          setLocMessage(t ? t('planner.locationUnavailable') : 'Location search failed');
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocMessage(t ? t('planner.locationDenied') : 'Location permission denied');
        } else {
          setLocMessage(t ? t('planner.locationUnavailable') : 'Could not retrieve location');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSelect = (stop) => {
    setQuery(stop.stop_name);
    setIsOpen(false);
    if (onChange) onChange(stop.stop_name);
    if (onSelectStop) onSelectStop(stop);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    if (onChange) onChange('');
    if (onSelectStop) onSelectStop(null);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    const currentList = results.length > 0 ? results : (query.length < 2 ? recentSearches : []);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < currentList.length) {
        handleSelect(currentList[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Highlight query match in string
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="font-semibold text-navy bg-teal-tint px-0.5 rounded-sm">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const showRecent = isOpen && query.trim().length < 2 && recentSearches.length > 0;
  const showResults = isOpen && results.length > 0;
  const showEmpty = isOpen && query.trim().length >= 2 && !isLoading && results.length === 0;

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1 text-left ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-tx flex items-center justify-between">
          <span>{label} {required && <span className="text-[#C8372D]">*</span>}</span>
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-tx-muted pointer-events-none">
          <MapPin className="w-4 h-4 text-teal" strokeWidth={1.75} />
        </div>
        
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-popup`}
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full min-h-[44px] pl-9 pr-10 py-2.5 bg-surface border text-tx placeholder:text-tx-muted rounded-[var(--radius-control)] text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:border-teal ${
            error ? 'border-[#C8372D]' : 'border-border'
          }`}
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 p-1.5 text-tx-muted hover:text-tx rounded-full hover:bg-[#EDF0F0] focus-visible:ring-2 focus-visible:ring-teal"
            aria-label="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>



      {error && <p className="text-xs text-[#C8372D] font-medium mt-0.5">{error}</p>}

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          id={`${id}-popup`}
          role="listbox"
          className="absolute z-40 top-full left-0 right-0 mt-1 bg-surface border border-border rounded-[var(--radius-panel)] shadow-[var(--shadow-overlay)] max-h-72 overflow-y-auto"
        >
          {/* Nearby / Location helper button */}
          <div className="p-2 border-b border-border bg-[#F7F8F6] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locLoading}
              className="inline-flex items-center gap-1.5 text-teal font-medium hover:underline p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{locLoading ? 'Locating...' : (t ? t('planner.useLocation') : 'Use my location')}</span>
            </button>
            {recentSearches.length > 0 && onClearRecent && (
              <button
                type="button"
                onClick={onClearRecent}
                className="text-tx-muted hover:text-tx text-xs underline p-1"
              >
                {t ? t('planner.clearRecent') : 'Clear'}
              </button>
            )}
          </div>

          {locMessage && (
            <div className="p-2.5 text-xs text-[#8A5A00] bg-[#FEF7E8] border-b border-border">
              {locMessage}
            </div>
          )}

          {/* Nearby stops returned by GPS */}
          {nearbyStops.length > 0 && (
            <div className="py-1 border-b border-border">
              <div className="px-3 py-1 text-xs font-semibold text-tx-muted uppercase tracking-wider">
                {t ? t('planner.nearby') : 'Nearby stops'}
              </div>
              {nearbyStops.map((stop, i) => (
                <button
                  key={`nearby-${stop.stop_id || i}`}
                  type="button"
                  onClick={() => handleSelect(stop)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-teal-tint flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-tx">{stop.stop_name}</span>
                  {stop.distance_km != null && (
                    <span className="text-xs text-tx-muted tabular-nums">{stop.distance_km} km</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Autocomplete Results */}
          {showResults && (
            <div className="py-1">
              {results.map((stop, i) => {
                const isSelected = i === activeIndex;
                return (
                  <button
                    key={stop.stop_id || i}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(stop)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-teal-tint text-navy font-medium' : 'text-tx hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{renderHighlightedText(stop.stop_name, query)}</span>
                      {stop.stop_code && (
                        <span className="text-xs text-tx-muted tabular-nums">Code: {stop.stop_code}</span>
                      )}
                    </div>
                    {stop.distance_km != null && (
                      <span className="text-xs text-tx-muted tabular-nums shrink-0">{stop.distance_km} km</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Recent Searches */}
          {showRecent && (
            <div className="py-1">
              <div className="px-3 py-1 text-xs font-semibold text-tx-muted uppercase tracking-wider">
                {t ? t('planner.recent') : 'Recent searches'}
              </div>
              {recentSearches.map((item, i) => {
                const isSelected = i === activeIndex;
                return (
                  <button
                    key={`recent-${item.stop_id || i}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                      isSelected ? 'bg-teal-tint text-navy font-medium' : 'text-tx hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-tx-muted shrink-0" />
                    <span>{item.stop_name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Suggested Major Transit Hubs (Zero-query Quick Select) */}
          {isOpen && query.trim().length === 0 && suggestedHubs.length > 0 && (
            <div className="py-1 border-t border-border/50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-navy uppercase tracking-wider bg-[#F7F8F6] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal" />
                  <span>Suggested Major Transit Hubs</span>
                </span>
                <span className="text-[10px] text-teal font-medium">Quick Select</span>
              </div>
              {suggestedHubs.map((hub, i) => (
                <button
                  key={`hub-${hub.stop_id || i}`}
                  type="button"
                  onClick={() => handleSelect(hub)}
                  className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-teal-tint transition-colors border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-6 h-6 rounded bg-navy/10 text-teal flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-navy text-xs sm:text-sm truncate">{hub.stop_name}</div>
                      <div className="text-[11px] text-tx-muted truncate">{hub.hub_category || 'Major Delhi Terminal'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-[#F7F8F6] border border-border px-1.5 py-0.5 rounded text-navy shrink-0 font-medium">
                    {hub.stop_code || `Stop ${hub.stop_id}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Empty search */}
          {showEmpty && (
            <div className="p-4 text-center text-sm text-tx-muted">
              {t ? t('planner.noStopsFound') : 'No stops found matching your search.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
