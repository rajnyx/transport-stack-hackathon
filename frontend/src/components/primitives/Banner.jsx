import React from 'react';
import { Info, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export default function Banner({
  meta = null,
  className = '',
}) {
  const { t } = useTranslation();
  const isSimulated = meta?.data_mode === 'demo' || meta?.data_tier === 'demo_synthetic';

  if (isSimulated) {
    return (
      <div className={`w-full bg-[#FEF3C7] border-b border-[#FDE047] px-4 py-2 text-xs text-[#8A5A00] flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>SIMULATED DEMO DATA:</strong> Bus occupancy estimates shown are generated for testing purposes.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-navy text-white/90 border-b border-navy px-4 py-2 text-xs ${className}`}>
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <Info className="w-3.5 h-3.5 text-teal-light flex-shrink-0" />
          <span className="truncate">
            <strong className="text-white">DELHI ETM DATA:</strong> {t('app.data_disclaimer')} (Oct 01 – Oct 31, 2026). Historical patterns, not live GPS.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-white/70 font-mono flex-shrink-0">
          GTFS + 2,559,899 tickets
        </span>
      </div>
    </div>
  );
}
