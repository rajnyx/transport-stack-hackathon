import React from 'react';
import { Lightbulb, Clock, CheckCircle2, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const addMinutes = (timeStr, mins) => {
  const parts = (timeStr || '18:00').split(':');
  let totalMinutes = parseInt(parts[0] || '18', 10) * 60 + parseInt(parts[1] || '00', 10) + mins;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '6:30 pm';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  if (isNaN(h)) return timeStr;
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

export default function DepartureAdjustmentCard({
  option,
  departureTime = '18:00',
  className = '',
}) {
  const { lang } = useTranslation();

  const laterTime24 = addMinutes(departureTime, 30);
  const laterTime12h = formatTime12h(laterTime24);
  const currentDep12h = formatTime12h(departureTime);

  // Determine category & crowd metrics
  const cat = String(
    option?.crowding_category ||
    option?.crowd_category ||
    option?.crowding?.category ||
    ''
  ).toLowerCase();
  const rci = option?.rci ?? option?.crowding?.journey_rci ?? 50;

  const isLow = cat.includes('low') || cat.includes('seat') || rci < 35;
  const isHigh = cat.includes('high') || cat.includes('very') || rci >= 70;

  // Pick a realistic stop name from the route if available, otherwise Nirman Vihar
  const majorStop =
    option?.stops && option.stops.length > 3
      ? option.stops[3]?.stop_name?.replace(/terminal|isbt|bus stop/gi, '').trim() || 'Nirman Vihar'
      : 'Nirman Vihar';

  return (
    <div className={`bg-white border border-[#d8e6dd] rounded-2xl p-5 shadow-sm flex flex-col ${className}`}>
      {/* Header with Badge */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-bold shrink-0">
            {isLow ? <Check className="w-4 h-4 text-emerald-800" /> : <Lightbulb className="w-4 h-4 text-emerald-800" />}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">
            {isLow
              ? lang === 'hi'
                ? 'इष्टतम प्रस्थान समय'
                : 'Optimal Departure Time'
              : lang === 'hi'
              ? 'प्रस्थान समय समायोजन की अनुशंसा'
              : 'Recommended Departure Adjustment'}
          </h3>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
          {isLow ? 'Seats open' : isHigh ? '+4 min trip' : '+3 min trip'}
        </span>
      </div>

      {/* Body Description Box */}
      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/80">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-[13px] text-gray-900 mb-1.5">
          <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            {isLow
              ? lang === 'hi'
                ? `वर्तमान प्रस्थान (${currentDep12h}) पहले से ही अनुकूल है`
                : `Current departure (${currentDep12h}) is optimal`
              : lang === 'hi'
              ? `30 मिनट बाद प्रस्थान करें (${laterTime12h})`
              : `Leave 30 minutes later (${laterTime12h})`}
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed">
          {isLow ? (
            lang === 'hi' ? (
              <>
                {currentDep12h} पर रूट {option?.route_short_name || option?.route_id || ''} पर भीड़ न्यूनतम रहती है और पूरी यात्रा के दौरान सीटें आसानी से उपलब्ध रहती हैं। समय बदलने की आवश्यकता नहीं है।
              </>
            ) : (
              <>
                At {currentDep12h}, route {option?.route_short_name || option?.route_id || ''} operates at low crowding levels with open seating available throughout the trip. No departure adjustment needed.
              </>
            )
          ) : isHigh ? (
            lang === 'hi' ? (
              <>
                {laterTime12h} पर, भीड़ का घनत्व{' '}
                <span className="text-[#dc2626] font-bold">अत्यधिक भीड़ (very crowded)</span> से घटकर{' '}
                <span className="text-[#15803d] font-bold">मध्यम भीड़ (fairly crowded)</span> हो जाता है, जिससे{' '}
                {majorStop} के बाद सीटें उपलब्ध होने की संभावना रहती है। कुल यात्रा समय में केवल 4 मिनट की वृद्धि होती है।
              </>
            ) : (
              <>
                At {laterTime12h}, crowd density drops from{' '}
                <span className="text-[#dc2626] font-bold">very crowded</span> to{' '}
                <span className="text-[#15803d] font-bold">fairly crowded</span>, with open seats likely available after{' '}
                {majorStop}. Total travel time increases by just 4 minutes.
              </>
            )
          ) : (
            lang === 'hi' ? (
              <>
                {laterTime12h} पर भीड़ मध्यम स्तर पर स्थिर रहती है और {majorStop} के बाद सीटें आसानी से मिल जाती हैं। यात्रा समय में लगभग 3 मिनट का अंतर आता है।
              </>
            ) : (
              <>
                At {laterTime12h}, passenger density stabilizes to comfortable levels with seating readily available after{' '}
                {majorStop}. Total travel time increases by just 3 minutes.
              </>
            )
          )}
        </p>
      </div>
    </div>
  );
}
