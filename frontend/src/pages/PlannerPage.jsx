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

  const [destQuery, setDestQuery] = useState('Connaught Place');
  const [destStop, setDestStop] = useState({ stop_id: '365', stop_name: 'Shivaji Stadium Terminal (Connaught Place)' });

  const [departureTime, setDepartureTime] = useState('18:00');
  const [timeDisplay, setTimeDisplay] = useState('6:00 PM');
  const [preference, setPreference] = useState(() => {
    try {
      return localStorage.getItem(PREF_KEY) || 'fastest';
    } catch {
      return 'fastest';
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

  const timeOptions = [
    { value: '08:00', label: '8:00 AM (Morning Rush)' },
    { value: '09:00', label: '9:00 AM (Peak AM)' },
    { value: '11:00', label: '11:00 AM (Midday)' },
    { value: '13:00', label: '1:00 PM (Afternoon)' },
    { value: '17:00', label: '5:00 PM (Early PM)' },
    { value: '18:00', label: '6:00 PM (Peak PM)' },
    { value: '19:30', label: '7:30 PM (Evening Return)' },
    { value: '21:00', label: '9:00 PM (Night)' },
  ];

  const handleTimeSelect = (val, label) => {
    setDepartureTime(val);
    setTimeDisplay(label.split(' ')[0] + ' ' + label.split(' ')[1]);
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

  return (
    <div className="py-4 sm:py-8 max-w-5xl mx-auto space-y-6">
      {/* Hero Visual Section matching Screenshot 1 */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-100">
        <DelhiBusHeroVisual />

        {/* Hero Overlay / Typography */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between pointer-events-none">
          <div className="max-w-xl space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {lang === 'hi'
                ? 'आपका भीड़-जागरूक बस यात्रा योजनाकार'
                : 'Your Crowdedness-Aware Journey Planner'}
            </h1>
            <p className="text-xs sm:text-base text-slate-700 font-medium leading-relaxed max-w-lg">
              {lang === 'hi'
                ? 'दिल्ली में सर्वोत्तम बस रूट खोजें — सुगम यात्रा के लिए वास्तविक समय भीड़ अंतर्दृष्टि के साथ।'
                : 'Find the best bus routes in Delhi — with real-time crowding insights for a smoother journey.'}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Journey Search Card matching Screenshot 1 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 -mt-10 sm:-mt-16 relative z-10 mx-2 sm:mx-6">
        {formError && (
          <div
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Upper Tier: 3 Horizontal Inputs Strip with hairline dividers */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          {/* Origin Stop */}
          <div className="md:col-span-5 p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-800 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                  {lang === 'hi' ? 'कहाँ से (From)' : 'From'}
                </span>
                <StopCombobox
                  id="origin-stop"
                  placeholder={lang === 'hi' ? 'प्रस्थान स्टॉप' : 'Anand Vihar'}
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
          </div>

          {/* Destination Stop */}
          <div className="md:col-span-4 p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-800 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                  {lang === 'hi' ? 'कहाँ तक (To)' : 'To'}
                </span>
                <StopCombobox
                  id="dest-stop"
                  placeholder={lang === 'hi' ? 'गंतव्य स्टॉप' : 'Connaught Place'}
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
          </div>

          {/* Departure Time */}
          <div className="md:col-span-3 p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors relative">
            <div
              className="flex items-start gap-3 cursor-pointer select-none"
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            >
              <Clock className="w-5 h-5 text-slate-800 shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                  {lang === 'hi' ? 'समय (At)' : 'At'}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-slate-900 text-sm">{timeDisplay}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* Time dropdown */}
            {showTimeDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleTimeSelect(opt.value, opt.label)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between text-slate-800"
                  >
                    <span>{opt.label}</span>
                    {departureTime === opt.value && <span className="text-emerald-700 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lower Tier: 3 Preferences + Find My Journey CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* 3 Preference Pills matching Screenshot 1 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Fastest Pill */}
            <button
              type="button"
              onClick={() => handlePrefChange('fastest')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                preference === 'fastest'
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 ring-2 ring-blue-100'
                  : 'bg-blue-50/50 text-blue-800 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>{lang === 'hi' ? 'सबसे तेज़' : 'Fastest'}</span>
            </button>

            {/* Seat Available Pill */}
            <button
              type="button"
              onClick={() => handlePrefChange('least_crowded')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                preference === 'least_crowded'
                  ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-600 ring-2 ring-emerald-100'
                  : 'bg-emerald-50/50 text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'hi' ? 'सीट उपलब्ध' : 'Seat Available'}</span>
            </button>

            {/* Combo Pill */}
            <button
              type="button"
              onClick={() => handlePrefChange('balanced')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                preference === 'balanced'
                  ? 'bg-amber-50 text-amber-900 border-2 border-amber-500 ring-2 ring-amber-100'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{lang === 'hi' ? 'कॉम्बो' : 'Combo'}</span>
            </button>
          </div>

          {/* Prominent Deep Green Find My Journey Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-full text-sm font-bold text-white bg-[#014738] hover:bg-[#064E3B] active:bg-[#023328] transition-all shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer"
          >
            <span>{lang === 'hi' ? 'मेरी यात्रा खोजें' : 'Find My Journey'}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Bottom Feature Strip matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 px-4 text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-[#014738] flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'स्मार्ट भीड़ अनुमान' : 'Smart Crowding Estimates'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' ? '25.6 लाख ईटीएम टिकट रिकॉर्ड्स पर आधारित' : 'Derived from 2.56M official ticket records'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-[#014738] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'वास्तविक रूट मैप' : 'Real-Time Route Map'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'पूर्ण दिल्ली बस स्टॉप व कॉरिडोर ट्रैक' : 'Full Delhi bus stops & corridor polyline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-[#014738] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              {lang === 'hi' ? 'दिल्ली में बेहतर यात्रा' : 'Travel Better in Delhi'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {lang === 'hi' ? 'सीट उपलब्धता व समय अनुकूलन' : 'Seat availability and departure advice'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
