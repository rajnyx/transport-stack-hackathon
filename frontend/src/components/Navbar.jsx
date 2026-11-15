import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import AppLogo from './AppLogo';
import { useTranslation } from '../i18n/LanguageContext';

export default function Navbar() {
  const { lang, toggleLang, t } = useTranslation();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const navLinkClass = ({ isActive }) =>
    `text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all ${
      isActive
        ? 'bg-[#145C3A] text-white shadow-xs'
        : 'text-[#121E19] hover:text-[#145C3A] hover:bg-[#E9F7EE]'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 text-xs select-none ${
      isActive ? 'text-[#145C3A] font-bold' : 'text-[#707971] font-medium'
    }`;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-xs border-b border-[#D8E6DD] sticky top-0 z-30 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145C3A] rounded"
            aria-label="CrowdWise Delhi Home"
          >
            <AppLogo />
          </Link>

          {/* Desktop Navigation Links matching Stitch Reference */}
          <div className="hidden md:flex items-center gap-5">
            <nav className="flex items-center gap-2">
              <NavLink to="/" end className={navLinkClass}>
                {lang === 'hi' ? 'यात्रा योजना' : 'Plan Journey'}
              </NavLink>
              <NavLink
                to="/results?origin_id=8256&dest_id=365&origin_name=Anand+Vihar+ISBT&dest_name=Shivaji+Stadium+Terminal+(Connaught+Place)&departure_time=18:00&preference=fastest"
                className={navLinkClass}
              >
                {lang === 'hi' ? 'यात्रा परिणाम' : 'Journey Results'}
              </NavLink>
              <NavLink to="/analytics" className={navLinkClass}>
                {lang === 'hi' ? 'एनालिटिक्स' : 'Analytics'}
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                {lang === 'hi' ? 'डेटा और पद्धति' : 'Data & Method'}
              </NavLink>
            </nav>

            {/* Live Feed Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#E9F7EE] text-[#145C3A] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D8E6DD]">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              <span>Delhi Transit Feed Active</span>
            </div>

            {/* Language Switcher (EN | HI) */}
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs font-bold px-2.5 py-1 rounded-md border border-[#D8E6DD] text-[#121E19] hover:bg-[#E9F7EE] transition-colors flex items-center gap-1 cursor-pointer"
              aria-label={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
            >
              <span className={lang === 'en' ? 'font-black text-[#145C3A]' : 'text-[#707971]'}>EN</span>
              <span className="text-[#D8E6DD]">|</span>
              <span className={lang === 'hi' ? 'font-black text-[#145C3A]' : 'text-[#707971]'}>HI</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 h-14 flex items-center justify-around px-2"
      >
        <NavLink to="/" end className={mobileNavLinkClass}>
          <span>{lang === 'hi' ? 'योजना' : 'Plan'}</span>
        </NavLink>
        <NavLink to="/results?origin_id=8256&dest_id=365" className={mobileNavLinkClass}>
          <span>{lang === 'hi' ? 'मैप' : 'Map'}</span>
        </NavLink>
        <NavLink to="/analytics" className={mobileNavLinkClass}>
          <span>{lang === 'hi' ? 'एनालिटिक्स' : 'Analytics'}</span>
        </NavLink>
        <NavLink to="/about" className={mobileNavLinkClass}>
          <span>{lang === 'hi' ? 'डेटा' : 'Method'}</span>
        </NavLink>
        <button
          type="button"
          onClick={toggleLang}
          className="text-xs font-bold text-slate-600 px-2 py-1"
        >
          {lang === 'en' ? 'HI' : 'EN'}
        </button>
      </nav>
    </>
  );
}
