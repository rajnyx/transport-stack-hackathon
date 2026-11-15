import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import AppLogo from './AppLogo';
import { useTranslation } from '../i18n/LanguageContext';

export default function Navbar() {
  const { lang, toggleLang, t } = useTranslation();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const navLinkClass = ({ isActive }) =>
    `text-xs sm:text-sm font-medium transition-colors ${
      isActive
        ? 'text-slate-900 font-bold border-b-2 border-slate-900 pb-1'
        : 'text-slate-600 hover:text-slate-900 pb-1'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 text-xs select-none ${
      isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
    }`;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded"
            aria-label="Delhi Bus / CrowdWise Home"
          >
            <AppLogo isLanding={isLanding} />
          </Link>

          {/* Desktop Navigation Links matching Screenshot 1 & 2 */}
          <div className="hidden sm:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <NavLink to="/" end className={navLinkClass}>
                {lang === 'hi' ? 'यात्रा योजना' : 'Plan Journey'}
              </NavLink>
              <NavLink
                to="/results?origin_id=8256&dest_id=365&origin_name=Anand+Vihar+ISBT&dest_name=Shivaji+Stadium+Terminal+(Connaught+Place)"
                className={navLinkClass}
              >
                {lang === 'hi' ? 'लाइव मैप' : 'Live Map'}
              </NavLink>
              <NavLink to="/analytics" className={navLinkClass}>
                {lang === 'hi' ? 'एनालिटिक्स' : 'Analytics'}
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                {lang === 'hi' ? 'डेटा और पद्धति' : 'Data & method'}
              </NavLink>
            </nav>

            {/* Language Switcher (EN | HI) */}
            <button
              type="button"
              onClick={toggleLang}
              className="text-xs font-semibold px-2.5 py-1 rounded border border-slate-200 text-slate-700 hover:border-slate-300 transition-colors flex items-center gap-1"
              aria-label={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
            >
              <span className={lang === 'en' ? 'font-bold text-slate-900' : 'text-slate-500'}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={lang === 'hi' ? 'font-bold text-slate-900' : 'text-slate-500'}>HI</span>
            </button>

            {/* User Profile Avatar Circle (from Screenshot 1) */}
            <div
              className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
              title="User Account"
            >
              <User className="w-4 h-4 text-white" />
            </div>
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
