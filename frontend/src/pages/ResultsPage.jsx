import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap, Users, Star, SlidersHorizontal, MapPin, Footprints } from 'lucide-react';
import { planJourney, getRouteCrowdProfile, getRouteFlow } from '../api';
import TransitRow from '../components/primitives/TransitRow';
import CompareTable from '../components/primitives/CompareTable';
import LeafletRouteMap from '../components/LeafletRouteMap';
import JourneyItinerary from '../components/JourneyItinerary';
import RouteCrowdingChart from '../components/RouteCrowdingChart';
import DepartureScrubber from '../components/DepartureScrubber';
import StopFlowDrawer from '../components/StopFlowDrawer';
import Skeleton from '../components/primitives/Skeleton';
import { useTranslation } from '../i18n/LanguageContext';
import { CANONICAL_DELHI_25_STOPS } from '../utils/formatters';

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

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const queryParams = new URLSearchParams(location.search);

  const originId = queryParams.get('origin_id') || '8256';
  const originName = queryParams.get('origin_name') || 'Anand Vihar ISBT';
  const destId = queryParams.get('dest_id') || '365';
  const destName = queryParams.get('dest_name') || 'Shivaji Stadium Terminal (Connaught Place)';
  const departureTime = queryParams.get('departure_time') || '18:00';
  const initialPref = queryParams.get('preference') || 'least_crowded';

  const rawOffset = parseInt(queryParams.get('offset') || '0', 10);
  const initialOffset = [0, 15, 30, 45, 60].includes(rawOffset) ? rawOffset : 0;
  const [offsetMinutes, setOffsetMinutes] = useState(initialOffset);

  const [preference, setPreference] = useState(initialPref);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [showCompare, setShowCompare] = useState(false);
  const [routeProfileData, setRouteProfileData] = useState(null);
  const [weekendProfileData, setWeekendProfileData] = useState(null);

  // Stop Flow Drawer State
  const [flowDrawerOpen, setFlowDrawerOpen] = useState(false);
  const [selectedStopForFlow, setSelectedStopForFlow] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [flowLoading, setFlowLoading] = useState(false);

  useEffect(() => {
    document.title = `${originName} → ${destName} | CrowdWise`;
  }, [originName, destName]);

  // Keep offsetMinutes state in sync with URL if URL changes externally
  useEffect(() => {
    const currentOffsetInUrl = parseInt(queryParams.get('offset') || '0', 10);
    if ([0, 15, 30, 45, 60].includes(currentOffsetInUrl) && currentOffsetInUrl !== offsetMinutes) {
      setOffsetMinutes(currentOffsetInUrl);
    }
  }, [location.search]);

  const fetchPlan = () => {
    setLoading(true);
    setError(null);

    planJourney({
      originId,
      destId,
      departureTime,
      preference,
      offsetMinutes,
    })
      .then((res) => {
        setPlanData(res.data);
        setSelectedOptionIndex(0);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || (lang === 'hi' ? 'यात्रा की गणना करने में विफल।' : 'Failed to calculate journey options.'));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlan();
  }, [originId, destId, departureTime, preference, offsetMinutes]);

  const rawOptions = planData?.options || [];

  // If API returns options, dynamically map their scheduled departures around shifted time
  const options = rawOptions.map((opt, idx) => {
    let dep;
    if (opt.scheduled_departure && opt.scheduled_departure.slice(0, 5) >= departureTime) {
      dep = opt.scheduled_departure.slice(0, 5);
    } else if (opt.wait_time_min !== undefined && opt.wait_time_min !== null) {
      dep = addMinutes(departureTime, Math.round(opt.wait_time_min) + offsetMinutes);
    } else {
      dep = addMinutes(departureTime, idx * 5 + offsetMinutes);
    }
    const dur = Math.round(opt.total_duration_minutes ?? opt.total_time_min ?? 40);
    const arr = opt.scheduled_arrival && opt.scheduled_arrival.slice(0, 5) > dep
      ? opt.scheduled_arrival.slice(0, 5)
      : addMinutes(dep, dur);
    return {
      ...opt,
      scheduled_departure: dep,
      scheduled_arrival: arr,
      total_time_min: dur,
    };
  });

  const selectedOption = options[selectedOptionIndex] || options[0] || null;

  useEffect(() => {
    const routeIdentifier = selectedOption?.route_short_name || selectedOption?.route_id;
    if (routeIdentifier) {
      setRouteProfileData(null);
      setWeekendProfileData(null);
      getRouteCrowdProfile(routeIdentifier, 'WEEKDAY')
        .then((res) => {
          if (res?.data) setRouteProfileData(res.data);
        })
        .catch(() => {});
      getRouteCrowdProfile(routeIdentifier, 'SUNDAY')
        .then((res) => {
          if (res?.data) setWeekendProfileData(res.data);
        })
        .catch(() => {});
    }
  }, [selectedOption?.route_id, selectedOption?.route_short_name]);

  // Fetch Stop Flow data when drawer is opened for the active route
  useEffect(() => {
    if (flowDrawerOpen && selectedOption) {
      const routeIdentifier = selectedOption.route_id || selectedOption.route_short_name || '433UP';
      const dir = selectedOption.direction_id === 1 ? 'DOWN' : 'UP';
      const depHour = parseInt((selectedOption.scheduled_departure || departureTime).slice(0, 2), 10) || 8;

      setFlowLoading(true);
      getRouteFlow(routeIdentifier, { direction: dir, hour: depHour, dayType: 'weekday' })
        .then((res) => {
          if (res?.data) setFlowData(res.data);
          setFlowLoading(false);
        })
        .catch(() => {
          setFlowLoading(false);
        });
    }
  }, [flowDrawerOpen, selectedOption?.route_id]);

  const handleStopClick = (stop) => {
    setSelectedStopForFlow(stop);
    setFlowDrawerOpen(true);
  };

  const leftColRef = useRef(null);
  const mapCardRef = useRef(null);
  const [itineraryHeight, setItineraryHeight] = useState(null);

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 1024 && leftColRef.current && mapCardRef.current) {
        const leftH = leftColRef.current.offsetHeight;
        const mapH = mapCardRef.current.offsetHeight;
        const targetH = Math.round(leftH - mapH - 20);
        if (targetH > 220) {
          setItineraryHeight(targetH);
          return;
        }
      }
      setItineraryHeight(null);
    };

    updateHeight();
    const rafId = requestAnimationFrame(updateHeight);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateHeight();
      });
      if (leftColRef.current) ro.observe(leftColRef.current);
      if (mapCardRef.current) ro.observe(mapCardRef.current);
    }

    window.addEventListener('resize', updateHeight);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [options.length, selectedOptionIndex, preference, planData]);

  const handlePreferenceChange = (newPref) => {
    setPreference(newPref);
    const newParams = new URLSearchParams(location.search);
    newParams.set('preference', newPref);
    navigate(`/results?${newParams.toString()}`, { replace: true });
  };

  const handleOffsetChange = (newOffset) => {
    setOffsetMinutes(newOffset);
    const newParams = new URLSearchParams(location.search);
    newParams.set('offset', String(newOffset));
    navigate(`/results?${newParams.toString()}`, { replace: true });
  };

  const departureHour = parseInt(departureTime.slice(0, 2), 10) || 8;

  return (
    <div className="py-2 space-y-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header Row matching Stitch Journey Results */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8e6dd] pb-4">
        {/* Left: Back Arrow, Route Name & Subtitle */}
        <div className="flex items-start gap-3">
          <Link
            to="/"
            className="p-1.5 text-[#121e19] hover:bg-[#e9f7ee] rounded-lg transition-colors mt-0.5 border border-[#d8e6dd]"
            title="Back to planner"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#004327]" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#121e19] flex items-center gap-2 flex-wrap">
              <span>{originName}</span>
              <ArrowRight className="w-4 h-4 text-[#707971] inline" />
              <span>{destName}</span>
            </h1>
            <p className="text-xs text-[#404942] mt-0.5">
              Leaves about {formatTime12h(departureTime)} • Based on past ticket data for this time of day
            </p>
          </div>
        </div>

        {/* Right: [Fastest] [Balanced] [Seat Available] & Compare top 3 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
          {/* Segmented Filter Pills */}
          <div className="bg-[#e9f7ee] p-1 rounded-xl flex items-center gap-1 border border-[#d8e6dd]">
            {[
              { id: 'fastest', label: lang === 'hi' ? 'सबसे तेज़' : 'Fastest' },
              { id: 'balanced', label: lang === 'hi' ? 'संतुलित' : 'Balanced' },
              { id: 'least_crowded', label: lang === 'hi' ? 'सीट उपलब्ध' : 'Seat Available' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handlePreferenceChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  preference === tab.id
                    ? 'bg-[#004327] text-white shadow-xs'
                    : 'text-[#404942] hover:text-[#121e19] hover:bg-white/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Compare Button */}
          {options.length > 1 && (
            <button
              type="button"
              onClick={() => setShowCompare(!showCompare)}
              className="text-xs text-[#136c46] hover:text-[#004327] font-semibold hover:underline px-2.5 py-1.5 rounded-lg border border-[#d8e6dd] bg-white transition-colors cursor-pointer"
            >
              {showCompare ? 'Close compare' : 'Compare top 3'}
            </button>
          )}
        </div>
      </div>

      {/* Compare Modal/Table if open */}
      {showCompare && options.length > 0 && (
        <div className="bg-white border border-[#d8e6dd] rounded-xl p-5 shadow-lg animate-fade-in">
          <CompareTable
            options={options}
            selectedOptionIndex={selectedOptionIndex}
            onSelectOption={(idx) => {
              setSelectedOptionIndex(idx);
              setShowCompare(false);
            }}
          />
        </div>
      )}

      {/* Main Two-Column Layout */}
      {loading && !options.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <Skeleton count={4} />
          </div>
          <div className="lg:col-span-7 h-[420px] bg-[#e9f7ee]/50 rounded-xl animate-pulse" />
        </div>
      ) : options.length === 0 ? (
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          {/* Departure Scrubber available even if no direct option at this exact offset */}
          <DepartureScrubber
            baseTime={departureTime}
            selectedOffset={offsetMinutes}
            onOffsetChange={handleOffsetChange}
            departureTips={planData?.departure_tips || planData?.tips || []}
            loading={loading}
          />
          <div className="bg-white border border-[#d8e6dd] rounded-2xl p-8 space-y-3">
            <p className="text-sm font-semibold text-[#121e19]">
              {t('results.noRoutes', 'No direct bus route found between these stops.')}
            </p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-[#004327] text-white rounded-xl text-xs font-semibold hover:bg-[#00341e] transition-colors"
            >
              {t('results.back', 'Back to planner')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Scrubber + Options Count + Boarding Advice + Transit Cards + Route Crowding Chart */}
          <div ref={leftColRef} className="lg:col-span-5 flex flex-col space-y-4">
            {/* F5 Departure Time Scrubber */}
            <div className="flex-shrink-0">
              <DepartureScrubber
                baseTime={departureTime}
                selectedOffset={offsetMinutes}
                onOffsetChange={handleOffsetChange}
                departureTips={planData?.departure_tips || planData?.tips || []}
                loading={loading}
              />
            </div>

            {/* F9 Boarding Advice Callout Banner */}
            {selectedOption?.boarding_advice?.show_advice === true && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                  <Footprints className="w-4 h-4" />
                </div>
                <div className="text-xs text-[#121e19] flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#004327]">
                      {t('boardingAdvice.title', 'Alternative Boarding Advice')}
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {Math.round(selectedOption.boarding_advice.walk_distance_m || 300)}m walk
                    </span>
                  </div>
                  <p className="text-[#2d3a33] leading-relaxed">
                    {selectedOption.boarding_advice.message || (
                      t('boardingAdvice.walkMessage', {
                        distance: Math.round(selectedOption.boarding_advice.walk_distance_m || 300),
                        stopName: selectedOption.boarding_advice.earlier_stop_name || 'Earlier stop',
                        crowdLevel: selectedOption.boarding_advice.earlier_crowd_level || 'Seats Available',
                      })
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Header: "N options found" | "Ranked for: [Preference]" */}
            <div className="flex items-center justify-between text-xs text-[#707971] px-1 flex-shrink-0">
              <span className="font-bold text-[#121e19]">
                {options.length} options found
              </span>
              <span className="text-xs text-[#404942]">
                Ranked for: <strong className="text-[#004327] capitalize">{preference.replace('_', ' ')}</strong>
              </span>
            </div>

            {/* List of Transit Option Cards */}
            <div className="space-y-3 flex-shrink-0">
              {options.map((opt, idx) => (
                <TransitRow
                  key={opt.trip_id || opt.route_id || idx}
                  option={opt}
                  isRecommended={idx === 0}
                  isSelected={selectedOptionIndex === idx}
                  preference={preference}
                  onSelect={() => setSelectedOptionIndex(idx)}
                />
              ))}
            </div>

            {/* TYPICAL CROWD CHART (Placed in Left Column per Stitch Design) */}
            <div className="flex-shrink-0">
              <RouteCrowdingChart
                routeNumber={selectedOption?.route_short_name || selectedOption?.route_id || '73UP'}
                option={selectedOption}
                selectedOption={selectedOption}
                profileData={routeProfileData}
                weekendProfileData={weekendProfileData}
                departureTime={departureTime}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Protected Map + Journey Itinerary */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Card 1: Map Card Container matching Stitch */}
            <div ref={mapCardRef} className="bg-white border border-[#d8e6dd] rounded-xl shadow-sm overflow-hidden flex flex-col flex-shrink-0">
              {/* Header above map */}
              <div className="px-4 py-3 bg-white border-b border-[#d8e6dd] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-[#004327] text-white font-mono font-bold text-xs px-2 py-0.5 rounded">
                    {selectedOption?.route_short_name || selectedOption?.route_id || '73UP'}
                  </span>
                  <span className="font-bold text-[#121e19] text-sm">
                    Route corridor and track
                  </span>
                </div>
                <span className="text-xs text-[#404942] font-medium">
                  {selectedOption?.stops?.length || 25} stops • {selectedOption?.distance_km || 13.4} km
                </span>
              </div>

              {/* PROTECTED LEAFLET ROUTE MAP (100% UNTOUCHED & PRESERVED) */}
              <div data-protected-component="leaflet-delhi-map" id="existing-interactive-delhi-map">
                <LeafletRouteMap
                  stops={(selectedOption?.stops && selectedOption.stops.length > 0) ? selectedOption.stops : CANONICAL_DELHI_25_STOPS}
                  shapePoints={selectedOption?.shape_points || []}
                  highlightOrigin={originId}
                  highlightDest={destId}
                  distanceKm={selectedOption?.distance_km || 13.4}
                  height="340px"
                />
              </div>
            </div>

            {/* Card 2: Journey Stops Schedule */}
            <div className="flex-shrink-0">
              <JourneyItinerary
                option={selectedOption}
                departureTime={departureTime}
                onStopClick={handleStopClick}
                style={itineraryHeight ? { height: `${itineraryHeight}px` } : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* F6 Stop Flow Drawer */}
      <StopFlowDrawer
        isOpen={flowDrawerOpen}
        onClose={() => setFlowDrawerOpen(false)}
        routeId={selectedOption?.route_short_name || selectedOption?.route_id || '433UP'}
        selectedStop={selectedStopForFlow}
        flowData={flowData}
        onSelectStop={(stop) => setSelectedStopForFlow(stop)}
        hour={departureHour}
        dayType="weekday"
        loading={flowLoading}
      />
    </div>
  );
}
