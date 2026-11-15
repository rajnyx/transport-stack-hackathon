import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Delhi Bus & CrowdWise Logo Component
 * Faithfully matches Screenshot 1 on the landing page and Screenshots 2, 3, 4 on inner pages.
 */
export function DelhiBusFrontIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Green rounded rectangle background */}
      <rect width="36" height="36" rx="8" fill="#015038" />
      {/* Bus Body */}
      <rect x="7" y="6" width="22" height="21" rx="4" fill="#FFFFFF" />
      {/* Windshield */}
      <rect x="9" y="8" width="18" height="8" rx="2" fill="#015038" />
      {/* Headlights */}
      <circle cx="11.5" cy="20.5" r="1.5" fill="#FBBF24" />
      <circle cx="24.5" cy="20.5" r="1.5" fill="#FBBF24" />
      {/* Center Grill / License plate */}
      <rect x="15" y="19.5" width="6" height="2" rx="0.5" fill="#015038" />
      {/* Front Wheels */}
      <rect x="8.5" y="27" width="4" height="3" rx="1" fill="#0F172A" />
      <rect x="23.5" y="27" width="4" height="3" rx="1" fill="#0F172A" />
      {/* Side mirrors */}
      <rect x="5.5" y="12" width="1.5" height="3.5" rx="0.75" fill="#FFFFFF" />
      <rect x="29" y="12" width="1.5" height="3.5" rx="0.75" fill="#FFFFFF" />
    </svg>
  );
}

export const AppMark = DelhiBusFrontIcon;

export function CrowdWiseBarIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect x="3" y="12" width="4" height="9" rx="1" fill="#0F172A" />
      <rect x="10" y="6" width="4" height="15" rx="1" fill="#0F172A" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#00828A" />
    </svg>
  );
}

export default function AppLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <DelhiBusFrontIcon size={34} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold text-lg tracking-tight text-[#004327]">
            CrowdWise
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#D8E6DD] text-[#121E19] rounded tracking-wider uppercase">
            DELHI
          </span>
        </div>
        <span className="text-[11px] text-[#404942] font-medium tracking-tight mt-0.5 leading-none">
          Smarter journeys. Better travel.
        </span>
      </div>
    </div>
  );
}
