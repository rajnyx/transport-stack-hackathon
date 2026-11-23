import React from 'react';
import { X } from 'lucide-react';
import RouteBadge from './primitives/RouteBadge';
import CrowdStrip from './primitives/CrowdStrip';
import { useTranslation } from '../i18n/LanguageContext';

export default function WhyThisRouteModal({ option, fastestOption, preference = 'balanced', onClose }) {
  const { lang } = useTranslation();
  if (!option) return null;

  const tFastest = fastestOption?.total_duration_minutes || option.total_duration_minutes;
  const tOption = option.total_duration_minutes;
  const timeDiff = tOption - tFastest;
  const routeNum = option.route_short_name || option.route_id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40"
    >
      <div className="bg-white rounded-panel max-w-md w-full p-5 space-y-4 border border-transit-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-transit-border pb-3">
          <div className="flex items-center gap-2">
            <RouteBadge routeNumber={routeNum} size="md" />
            <h3 className="font-bold text-sm text-navy">
              {lang === 'hi' ? 'यह विकल्प क्यों अनुशंसित है?' : 'Why this option was recommended'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-transit-textMuted hover:text-navy rounded-[4px] hover:bg-transit-bg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs text-transit-text">
          <div className="p-3 bg-transit-bg border border-transit-border rounded-[4px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-navy">
                {lang === 'hi' ? 'चयनित प्राथमिकता' : 'Selected priority'}
              </span>
              <span className="font-bold text-teal capitalize">
                {preference.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-transit-textMuted">
                {lang === 'hi' ? 'यात्रा समय' : 'Travel time'}
              </span>
              <span className="font-semibold text-navy tabular-nums">
                {tOption} min {timeDiff > 0 ? `(+${timeDiff} min vs fastest)` : '(fastest option)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-transit-textMuted">
                {lang === 'hi' ? 'भीड़ स्तर' : 'Crowd estimate'}
              </span>
              <CrowdStrip category={option.crowd_category} size="sm" />
            </div>
          </div>

          <p className="text-transit-text leading-relaxed">
            {preference === 'fastest'
              ? (lang === 'hi'
                ? 'यह विकल्प सबसे कम यात्रा समय के आधार पर शीर्ष पर रखा गया है।'
                : 'This option gets you to your destination in the least total minutes.')
              : preference === 'least_crowded'
              ? (lang === 'hi'
                ? 'यह विकल्प अधिकतम सीट उपलब्धता और कम भीड़ को प्राथमिकता देता है।'
                : 'This option prioritizes buses with available seating and minimal crowding.')
              : (lang === 'hi'
                ? 'संतुलित विकल्प यात्रा के समय और भीड़ दोनों को ध्यान में रखता है ताकि आरामदायक और तेज़ सफर मिल सके।'
                : 'Balanced ranking weighs travel time against bus crowdedness, aiming for comfort without adding unnecessary travel time.')}
          </p>

          <p className="text-[11px] text-transit-textMuted pt-1 border-t border-transit-border">
            {lang === 'hi'
              ? 'अनुमान ऐतिहासिक टिकट डेटा और स्टॉप-दर-स्टॉप लोड मॉडल पर आधारित हैं।'
              : 'Estimates are based on historical ticket transaction counts and stop-by-stop passenger reconstruction.'}
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold rounded-[4px] bg-navy text-white hover:bg-navy/90 transition-colors min-h-[44px]"
          >
            {lang === 'hi' ? 'समझ आ गया' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}
