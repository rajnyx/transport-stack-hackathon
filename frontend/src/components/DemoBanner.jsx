import React from 'react';
import { Database, Info } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function DemoBanner({ meta }) {
  const { lang } = useTranslation();

  const factualLine = meta?.factual_status_line ||
    'Historical ETM and e-ticketing records, 2026-10-01 to 2026-10-31. Timetable: public GTFS, valid Oct 2026. Estimates from past data, not live.';

  return (
    <aside
      aria-label="Dataset Provenance and Authenticity Banner"
      className="bg-[#004327] text-white text-xs px-3 sm:px-4 py-1.5 border-b border-[#0B422B] select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#9FF1C1] shrink-0" />
          <span className="text-white/90 text-xs font-normal">
            {lang === 'hi'
              ? 'ऐतिहासिक ETM और ई-टिकटिंग रिकॉर्ड, 1 अक्टूबर से 31 अक्टूबर 2026। समय सारिणी: सार्वजनिक GTFS। पिछले डेटा से अनुमान, लाइव नहीं।'
              : factualLine}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-white/70">
          <span>GTFS Timetable</span>
          <span>·</span>
          <span>ETM Tickets</span>
          <span>·</span>
          <span>Offline ML Estimates</span>
        </div>
      </div>
    </aside>
  );
}
