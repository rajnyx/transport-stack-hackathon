import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Zap,
  Users,
  Star,
  ArrowRight,
  BarChart2,
  Navigation,
  ShieldCheck,
  ChevronDown,
  AlertCircle,
  ArrowLeftRight,
  CheckCircle,
  Sparkles,
  History,
} from 'lucide-react';
import StopCombobox from '../components/primitives/StopCombobox';
import DelhiBusHeroVisual from '../components/DelhiBusHeroVisual';
import { useTranslation } from '../i18n/LanguageContext';

const RECENT_SEARCHES_KEY = 'crowdwise_recent_searches';
const PREF_KEY = 'crowdwise_pref';

export default function PlannerPage() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  // Search form state
  const [originQuery, setOriginQuery] = useState('Anand Vihar ISBT');
  const [originStop, setOriginStop] = useState({ stop_id: '8256', stop_name: 'Anand Vihar ISBT' });

  const [destQuery, setDestQuery] = useState('Shivaji Stadium / Connaught Place');
  const [destStop, setDestStop] = useState({ stop_id: '365', stop_name: 'Shivaji Stadium Terminal (Connaught Place)' });

  const [departureTime, setDepartureTime] = useState('18:00');
  const [timeDisplay, setTimeDisplay] = useState('Today, 6:00 PM (Evening Peak)');
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(PREF_KEY) || 'least_crowded';
    } catch {
      return 'least_crowded';
    }
  });

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [formError, setFormError] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    document.title = lang === 'hi' ? 'दिल्ली बस | यात्रा योजना' : 'Delhi Bus — Your Crowdedness-Aware Journey Planner';
  }, [lang]);

  const handlePrefChange = (newPref) => {
    setPreference(newPref);
    try {
      localStorage.setItem(PREF_KEY, newPref);
    } catch {}
  };

  const handleSwap = () => {
    const tempQuery = originQuery;
    const tempStop = originStop;
    setOriginQuery(destQuery);
    setOriginStop(destStop);
    setDestQuery(tempQuery);
    setDestStop(tempStop);
  };

  const handleHubClick = (hubName, stopId) => {
    setDestQuery(hubName);
    setDestStop({ stop_id: stopId || '365', stop_name: hubName });
    setFormError('');
  };

  const timeOptions = [
    { value: '08:00', label: 'Today, 8:00 AM (Morning Rush)' },
    { value: '09:00', label: 'Today, 9:00 AM (Peak AM)' },
    { value: '11:00', label: 'Today, 11:00 AM (Midday Low)' },
    { value: '13:00', label: 'Today, 1:00 PM (Afternoon)' },
    { value: '17:00', label: 'Today, 5:00 PM (Early PM)' },
    { value: '18:00', label: 'Today, 6:00 PM (Evening Peak)' },
    { value: '19:30', label: 'Today, 7:30 PM (Lower Crowd)' },
    { value: '21:00', label: 'Today, 9:00 PM (Night Service)' },
    { value: '08:30', label: 'Tomorrow Morning (08:30 AM)' },
  ];

  const handleTimeSelect = (val, label) => {
    setDepartureTime(val);
    setTimeDisplay(label);
    setShowTimeDropdown(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const originId = originStop?.stop_id || (originQuery ? '8256' : '');
    const destId = destStop?.stop_id || (destQuery ? '365' : '');

    if (!originId || !destId) {
      setFormError(
        lang === 'hi'
          ? 'कृपया प्रस्थान और गंतव्य दोनों स्टॉप चुनें।'
          : 'Please select both an origin and a destination stop.'
      );
      return;
    }

    const searchItem = {
      origin_id: originId,
      origin_name: originStop?.stop_name || originQuery,
      dest_id: destId,
      dest_name: destStop?.stop_name || destQuery,
      timestamp: Date.now(),
    };
    const updatedRecents = [
      searchItem,
      ...recentSearches.filter((s) => s.origin_id !== originId || s.dest_id !== destId),
    ].slice(0, 5);
    setRecentSearches(updatedRecents);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedRecents));
    } catch {}

    const params = new URLSearchParams({
      origin_id: originId,
      origin_name: originStop?.stop_name || originQuery,
      dest_id: destId,
      dest_name: destStop?.stop_name || destQuery,
      departure_time: departureTime,
      preference,
    });

    navigate(`/results?${params.toString()}`);
  };

  const popularHubs = [
    { name: 'Kashmere Gate ISBT', id: '1025' },
    { name: 'Nehru Place Bus Terminal', id: '2559' },
    { name: 'Dhaula Kuan', id: '3102' },
    { name: 'AIIMS Ring Road', id: '2829' },
    { name: 'Sarai Kale Khan', id: '2325' },
  ];

  return (
    <div className="w-full flex flex-col space-y-10">
      {/* Top Ambient Banner & Hero Section */}
      <section className="relative w-full pt-4 pb-8 overflow-hidden">
        {/* Subtle Delhi Geometry Accents */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply">
          <svg className="w-full h-full text-emerald-900/10" fill="none" preserveAspectRatio="none" viewBox="0 0 1440 400">
            <path d="M0,120 Q360,70 720,130 T1440,110 L1440,400 L0,400 Z" fill="currentColor" />
            <path d="M0,180 Q420,120 840,190 T1440,150 L1440,400 L0,400 Z" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        {/* DTC Monogram Watermark */}
        <div className="absolute right-6 top-8 opacity-5 pointer-events-none select-none hidden lg:block">
          <span className="text-[200px] leading-none text-[#004327] font-black tracking-tighter">DTC</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Badges & Live Status */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-[#d8e6dd] text-[#136c46] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#136c46] animate-pulse"></span>
              <span>{lang === 'hi' ? 'दिल्ली ईटीएम टिकटिंग डेटा कनेक्टेड' : 'Delhi ETM Ticketing Stream Connected'}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3f1e8] text-[#404942] text-xs font-medium">
              <Navigation className="w-3.5 h-3.5 text-[#004327]" />
              <span>{lang === 'hi' ? '482 सक्रिय क्लस्टर व डीटीसी कॉरिडोर' : '482 Active Cluster & DTC Corridors'}</span>
            </div>
          </div>

          {/* Hero Header & Visual Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-12 items-center mb-8">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#004327] tracking-tight leading-tight">
                {lang === 'hi'
                  ? 'आपका भीड़-जागरूक बस यात्रा योजनाकार'
                  : 'Your Crowdedness-Aware Journey Planner'}
              </h1>
              <p className="text-base sm:text-lg text-[#404942] max-w-xl leading-relaxed">
                {lang === 'hi'
                  ? 'दिल्ली में सर्वोत्तम बस रूट खोजें — टिकटिंग डेटा से प्राप्त सांख्यिकीय भीड़ अंतर्दृष्टि के साथ।'
                  : 'Find the best bus routes in Delhi — with statistical crowd insights derived from ticketing data to secure a seat and avoid peak squeeze.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-[#121e19] text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#136c46]" />
                  <span>DTC & DIMTS Compatible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#136c46]" />
                  <span>Occupancy Forecasting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#136c46]" />
                  <span>Schedule-Aligned Timetable</span>
                </div>
              </div>
            </div>

            {/* Delhi Bus Composition Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#d8e6dd] bg-white">
                <DelhiBusHeroVisual />
              </div>
            </div>
          </div>

          {/* Main Journey Search Box Floating Card (Level 2 Elevation) */}
          <div className="w-full bg-white rounded-2xl shadow-xl border border-[#d8e6dd] p-5 sm:p-7 relative z-20">
            {formError && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Input Fields Row with Inset Swap Button */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 relative items-center">
                {/* Origin Field */}
                <div className="md:col-span-4 bg-[#e9f7ee] hover:bg-[#e3f1e8] rounded-xl p-3 border border-[#d8e6dd]/60 transition-colors flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#d8e6dd] flex items-center justify-center text-[#004327] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-[#707971] uppercase tracking-wider block" htmlFor="origin-stop">
                      {lang === 'hi' ? 'कहाँ से (From)' : 'From (Boarding)'}
                    </label>
                    <StopCombobox
                      id="origin-stop"
                      placeholder={lang === 'hi' ? 'प्रस्थान स्टॉप दर्ज करें' : 'Enter bus stop or terminal...'}
                      value={originQuery}
                      selectedStop={originStop}
                      onChange={(val) => {
                        setOriginQuery(val);
                        setOriginStop(null);
                        setFormError('');
                      }}
                      onSelectStop={(stop) => {
                        setOriginStop(stop);
                        setOriginQuery(stop.stop_name);
                        setFormError('');
                      }}
                      t={t}
                    />
                  </div>
                </div>

                {/* Floating Swap Button */}
                <div className="hidden md:flex absolute left-[33.33%] -ml-4 z-30">
                  <button
                    type="button"
                    onClick={handleSwap}
                    aria-label="Swap Origin and Destination"
                    className="w-8 h-8 rounded-full bg-white hover:bg-[#deebe3] shadow-md text-[#004327] border border-[#d8e6dd] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Destination Field */}
                <div className="md:col-span-4 bg-[#e9f7ee] hover:bg-[#e3f1e8] rounded-xl p-3 border border-[#d8e6dd]/60 transition-colors flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#145c3a] text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="text-[11px] font-semibold text-[#707971] uppercase tracking-wider block" htmlFor="dest-stop">
                      {lang === 'hi' ? 'कहाँ तक (To)' : 'To (Destination)'}
                    </label>
                    <StopCombobox
                      id="dest-stop"
                      placeholder={lang === 'hi' ? 'गंतव्य स्टॉप दर्ज करें' : 'Enter destination stop...'}
                      value={destQuery}
                      selectedStop={destStop}
                      onChange={(val) => {
                        setDestQuery(val);
                        setDestStop(null);
                        setFormError('');
                      }}
                      onSelectStop={(stop) => {
                        setDestStop(stop);
                        setDestQuery(stop.stop_name);
                        setFormError('');
                      }}
                      t={t}
                    />
                  </div>
                </div>

                {/* Departure Time Field */}
                <div className="md:col-span-4 bg-[#e9f7ee] hover:bg-[#e3f1e8] rounded-xl p-3 border border-[#d8e6dd]/60 transition-colors flex items-center justify-between gap-2 relative">
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer select-none"
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#d8e6dd] flex items-center justify-center text-[#004327] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-semibold text-[#707971] uppercase tracking-wider block">
                        {lang === 'hi' ? 'प्रस्थान समय' : 'Departure Time'}
                      </span>
                      <span className="font-semibold text-sm text-[#121e19] truncate">{timeDisplay}</span>
                    </div>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 text-[#707971] shrink-0 cursor-pointer"
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                  />

                  {/* Time dropdown */}
                  {showTimeDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#d8e6dd] rounded-xl shadow-xl z-50 py-1.5 text-xs">
                      {timeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleTimeSelect(opt.value, opt.label)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-[#e9f7ee] flex items-center justify-between text-[#121e19] transition-colors"
                        >
                          <span className={departureTime === opt.value ? 'font-bold text-[#004327]' : ''}>
                            {opt.label}
                          </span>
                          {departureTime === opt.value && <span className="text-[#136c46] font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Row: Preferences Pills + Find Journey Button */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
                {/* Routing Optimisation Mode Preferences */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#404942] uppercase tracking-wider mr-1 hidden sm:inline">
                    {lang === 'hi' ? 'प्राथमिकता:' : 'Preference:'}
                  </span>

                  {/* Fastest Pill */}
                  <button
                    type="button"
                    onClick={() => handlePrefChange('fastest')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      preference === 'fastest'
                        ? 'bg-[#145c3a] text-white shadow-sm ring-1 ring-[#004327]'
                        : 'bg-[#e3f1e8] text-[#121e19] hover:bg-[#d8e6dd]'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'hi' ? 'सबसे तेज़' : 'Fastest'}</span>
                  </button>

                  {/* Seat Available (Default Active) */}
                  <button
                    type="button"
                    onClick={() => handlePrefChange('least_crowded')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      preference === 'least_crowded'
                        ? 'bg-[#145c3a] text-white shadow-sm ring-1 ring-[#004327]'
                        : 'bg-[#e3f1e8] text-[#121e19] hover:bg-[#d8e6dd]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-300" />
                    <span>{lang === 'hi' ? 'कम भीड़ (सीट)' : 'Seat Available'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a2f4c3]"></span>
                  </button>

                  {/* Combo (Balanced) */}
                  <button
                    type="button"
                    onClick={() => handlePrefChange('balanced')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      preference === 'balanced'
                        ? 'bg-[#145c3a] text-white shadow-sm ring-1 ring-[#004327]'
                        : 'bg-[#e3f1e8] text-[#121e19] hover:bg-[#d8e6dd]'
                    }`}
                  >
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>{lang === 'hi' ? 'कॉम्बो (संतुलित)' : 'Combo (Balanced)'}</span>
                  </button>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="px-7 py-3 rounded-lg bg-[#004327] hover:bg-[#0b422b] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'मेरी यात्रा खोजें' : 'Find My Journey'}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Quick Suggestion Terminal Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#d8e6dd]">
                <span className="text-xs text-[#707971] flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> {lang === 'hi' ? 'प्रमुख हब:' : 'Popular hubs:'}
                </span>
                {popularHubs.map((hub) => (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => handleHubClick(hub.name, hub.id)}
                    className="px-2.5 py-1 rounded bg-[#e9f7ee] hover:bg-[#e3f1e8] text-[#121e19] text-xs font-medium transition-colors cursor-pointer"
                  >
                    {hub.name}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3 Core Benefits Showcase (Asymmetric civic cards matching Stitch Screenshot 1) */}
      <section className="w-full py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#136c46] font-bold">
                Predictive Civic Intelligence
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#004327] tracking-tight mt-1">
                {lang === 'hi' ? 'दिल्ली ट्रांजिट वास्तविकता के लिए निर्मित' : 'Engineered for Delhi Transit Reality'}
              </h2>
            </div>
            <p className="text-sm text-[#404942] max-w-md leading-relaxed">
              {lang === 'hi'
                ? 'सामान्य मैप ऐप्स के विपरीत, CrowdWise ईटीएम यात्री लोड मॉडल को एकीकृत करता है ताकि आप वास्तव में बस में चढ़ सकें।'
                : 'Unlike generic map routing apps, CrowdWise integrates ETM passenger load models to recommend corridors you can actually board.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Smart Crowding Estimates */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-[#d8e6dd] transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#deebe3] text-[#004327] flex items-center justify-center mb-5">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#121e19] mb-2">
                  {lang === 'hi' ? 'स्मार्ट भीड़ अनुमान' : 'Smart Crowding Estimates'}
                </h3>
                <p className="text-sm text-[#404942] leading-relaxed mb-6">
                  {lang === 'hi'
                    ? 'लाखों ऐतिहासिक दिल्ली इलेक्ट्रॉनिक टिकटिंग (ETM) डेटा पर प्रशिक्षित मशीन-लर्निंग एल्गोरिदम प्रति स्टॉप भीड़ का सटीक अनुमान लगाते हैं।'
                    : 'Machine-learning algorithms trained on millions of historical Delhi electronic ticketing transactions (ETM) predict passenger crowding per stop.'}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#e9f7ee] flex items-center justify-between border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#136c46]" />
                  <span className="text-xs font-semibold text-[#121e19]">ETM Accuracy</span>
                </div>
                <span className="text-xs font-bold text-[#004327]">92.4% Match Rate</span>
              </div>
            </div>

            {/* Card 2: Real-Time Corridor Map */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-[#d8e6dd] transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#9ff1c1]/50 text-[#136c46] flex items-center justify-center mb-5">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#121e19] mb-2">
                  {lang === 'hi' ? 'वास्तविक रूट कॉरिडोर' : 'Real-Time Route Corridors'}
                </h3>
                <p className="text-sm text-[#404942] leading-relaxed mb-6">
                  {lang === 'hi'
                    ? 'सटीक DTC और क्लस्टर स्टॉप अनुक्रम, इंटरचेंज पॉइंट, पैदल स्थानान्तरण और आगामी लो-फ्लोर बस समय सारिणी।'
                    : 'Precise DTC & Cluster stop sequences, interchange points, walking transfers, and upcoming low-floor air-conditioned bus schedules.'}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#e9f7ee] flex items-center justify-between border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#136c46]" />
                  <span className="text-xs font-semibold text-[#121e19]">Interchange Buffer</span>
                </div>
                <span className="text-xs font-bold text-[#004327]">Auto-calculated</span>
              </div>
            </div>

            {/* Card 3: Travel Better in Delhi */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-[#d8e6dd] transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#d8e6dd] text-[#004327] flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#121e19] mb-2">
                  {lang === 'hi' ? 'दिल्ली में सुगम यात्रा' : 'Travel Better in Delhi'}
                </h3>
                <p className="text-sm text-[#404942] leading-relaxed mb-6">
                  {lang === 'hi'
                    ? 'अत्यधिक व्यस्त घंटों से बचें, वैकल्पिक समानांतर मार्ग खोजें, आसानी से बोर्ड करें और अपनी यात्रा के लिए एक आरामदायक सीट पाएं।'
                    : 'Avoid packed peak hours, discover alternative parallel routes, board with ease, and secure a comfortable seat for your commute.'}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#e9f7ee] flex items-center justify-between border border-[#d8e6dd]/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#136c46]" />
                  <span className="text-xs font-semibold text-[#121e19]">Peak Comfort Lift</span>
                </div>
                <span className="text-xs font-bold text-[#004327]">+3.4x Seating Chance</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
