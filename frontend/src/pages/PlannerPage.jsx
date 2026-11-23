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
  AlertCircle,
  ArrowLeftRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import StopCombobox from '../components/primitives/StopCombobox';
import DelhiBusHeroVisual from '../components/DelhiBusHeroVisual';
import { useTranslation } from '../i18n/LanguageContext';

const RECENT_SEARCHES_KEY = 'crowdwise_recent_searches';
const PREF_KEY = 'crowdwise_pref';

const getCurrentTimeString = () => {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return time24;
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export default function PlannerPage() {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  // Search form state
  const [originQuery, setOriginQuery] = useState('Anand Vihar ISBT');
  const [originStop, setOriginStop] = useState({ stop_id: '8256', stop_name: 'Anand Vihar ISBT' });

  const [destQuery, setDestQuery] = useState('Shivaji Stadium / Connaught Place');
  const [destStop, setDestStop] = useState({ stop_id: '365', stop_name: 'Shivaji Stadium Terminal (Connaught Place)' });

  // Departure Time Mode: 'now' vs 'other'
  const [departMode, setDepartMode] = useState('now');
  const [currentLiveTime, setCurrentLiveTime] = useState(getCurrentTimeString);
  const [customTime, setCustomTime] = useState(getCurrentTimeString);

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

  // Keep live time updated every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLiveTime(getCurrentTimeString());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

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

    const effectiveDepTime = departMode === 'now' ? getCurrentTimeString() : (customTime || '18:00');

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
      departure_time: effectiveDepTime,
      preference,
    });

    navigate(`/results?${params.toString()}`);
  };

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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Canonical Hackathon Demo Shortcut */}
              <div className="flex items-center justify-between pb-1 flex-wrap gap-2 border-b border-[#d8e6dd]/60">
                <span className="text-[11px] font-semibold text-[#707971]">
                  {lang === 'hi' ? 'त्वरित डेमो परीक्षण:' : 'Hackathon Showcase Corridor:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/results?origin_id=8256&origin_name=Anand+Vihar+ISBT&dest_id=365&dest_name=Shivaji+Stadium+Terminal+(Connaught+Place)&departure_time=18:00&preference=least_crowded');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9f7ee] hover:bg-[#d8e6dd] text-[#004327] text-xs font-bold border border-[#004327]/20 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try corridor: Anand Vihar → Connaught Place (6:00 pm)</span>
                  <ArrowRight className="w-3 h-3 text-[#004327]" />
                </button>
              </div>

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

                {/* Departure Time Field: Depart Now & Other custom time */}
                <div className="md:col-span-4 bg-[#e9f7ee] hover:bg-[#e3f1e8] rounded-xl p-3 border border-[#d8e6dd]/60 transition-colors flex flex-col justify-between gap-1.5 min-h-[76px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#707971] uppercase tracking-wider block">
                      {lang === 'hi' ? 'प्रस्थान समय' : 'Departure Time'}
                    </span>
                    <div className="inline-flex rounded-lg bg-white/80 p-0.5 border border-[#d8e6dd]">
                      <button
                        type="button"
                        onClick={() => setDepartMode('now')}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          departMode === 'now'
                            ? 'bg-[#145c3a] text-white shadow-xs'
                            : 'text-[#404942] hover:text-[#121e19]'
                        }`}
                      >
                        {lang === 'hi' ? 'अभी निकलें' : 'Depart now'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepartMode('other')}
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          departMode === 'other'
                            ? 'bg-[#145c3a] text-white shadow-xs'
                            : 'text-[#404942] hover:text-[#121e19]'
                        }`}
                      >
                        {lang === 'hi' ? 'अन्य समय' : 'Other'}
                      </button>
                    </div>
                  </div>

                  {departMode === 'now' ? (
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="w-8 h-8 rounded-lg bg-[#d8e6dd] flex items-center justify-center text-[#004327] shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#121e19]">
                          {formatTime12h(currentLiveTime)}
                        </span>
                        <span className="text-[10px] font-semibold bg-[#145c3a]/10 text-[#145c3a] px-2 py-0.5 rounded-full border border-[#145c3a]/20">
                          {lang === 'hi' ? 'वर्तमान समय' : 'Live Clock'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 pt-0.5">
                      <div className="w-8 h-8 rounded-lg bg-[#145c3a] text-white flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="time"
                          value={customTime}
                          onChange={(e) => setCustomTime(e.target.value)}
                          className="bg-white border border-[#d8e6dd] rounded-lg px-2.5 py-1 text-sm font-bold text-[#121e19] focus:outline-none focus:ring-2 focus:ring-[#145c3a] cursor-pointer shadow-2xs"
                          aria-label="Choose departure time"
                        />
                        <span className="text-xs font-semibold text-[#145c3a] truncate">
                          ({formatTime12h(customTime)})
                        </span>
                      </div>
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
                    <span>{lang === 'hi' ? 'सीट उपलब्ध' : 'Seat Available'}</span>
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
