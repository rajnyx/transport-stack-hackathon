import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function Footer() {
  const { lang } = useTranslation();

  return (
    <footer className="bg-white border-t border-[#D8E6DD] mt-16 text-[#707971] text-xs py-8 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1 max-w-2xl">
            <p className="text-[#404942] font-medium leading-relaxed">
              Based on historical ETM ticketing records and public timetable data. Crowd levels are statistical estimates, not live passenger counts. © CrowdWise Delhi.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#707971]">
              <Link to="/about" className="hover:text-[#145C3A] underline">
                Methodology & Accuracy Notes
              </Link>
              <span>·</span>
              <a
                href="https://otd.delhi.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#145C3A] underline"
              >
                Delhi Integrated Multi-Modal Transit System Data
              </a>
              <span>·</span>
              <Link to="/analytics" className="hover:text-[#145C3A] underline">
                Crowding Models
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#E9F7EE] text-[#145C3A] px-3 py-1.5 rounded-full text-xs font-semibold border border-[#D8E6DD] shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Public Transit Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
