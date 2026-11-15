import React from 'react';

/**
 * DelhiBusHeroVisual
 * High-fidelity SVG recreation of the Delhi landmark composition from Screenshot 1:
 * - Iconic India Gate in sand-stone hues
 * - Lush Delhi green trees and manicured lawns
 * - Blue low-floor Delhi AC bus on road
 */
export default function DelhiBusHeroVisual({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl relative select-none ${className}`}>
      <svg
        viewBox="0 0 900 320"
        className="w-full h-auto object-cover"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Delhi India Gate and DTC blue bus illustration"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="indiaGateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D97746" />
            <stop offset="40%" stopColor="#C26535" />
            <stop offset="100%" stopColor="#A85227" />
          </linearGradient>

          <linearGradient id="treesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E6B47" />
            <stop offset="100%" stopColor="#1B472E" />
          </linearGradient>

          <linearGradient id="busBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="60%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="900" height="320" fill="url(#skyGrad)" />

        {/* Soft atmospheric clouds / mist */}
        <ellipse cx="650" cy="180" rx="300" ry="70" fill="#FFFFFF" opacity="0.6" />
        <ellipse cx="250" cy="140" rx="200" ry="50" fill="#FFFFFF" opacity="0.4" />

        {/* Lush Green Trees Background (Right side behind India Gate) */}
        <g fill="url(#treesGrad)">
          {/* Canopy clusters */}
          <circle cx="580" cy="220" r="65" />
          <circle cx="640" cy="210" r="75" />
          <circle cx="720" cy="205" r="80" />
          <circle cx="810" cy="215" r="85" />
          <circle cx="880" cy="230" r="70" />
          <circle cx="520" cy="235" r="50" />
        </g>

        {/* India Gate (Right side, majestic silhouette in warm sandstone) */}
        <g transform="translate(680, 50)">
          {/* Cornice / Top Tier */}
          <rect x="-60" y="0" width="120" height="12" rx="2" fill="url(#indiaGateGrad)" />
          <rect x="-52" y="12" width="104" height="10" fill="#C26535" />
          <rect x="-44" y="22" width="88" height="8" fill="#B0582B" />

          {/* Inscription Attic Layer */}
          <rect x="-56" y="30" width="112" height="24" rx="1" fill="url(#indiaGateGrad)" />
          <rect x="-48" y="38" width="96" height="3" fill="#8C3F1B" opacity="0.6" />
          <rect x="-36" y="44" width="72" height="2" fill="#8C3F1B" opacity="0.4" />

          {/* Molding Layer */}
          <rect x="-62" y="54" width="124" height="8" rx="1" fill="#C26535" />

          {/* Main Pillars */}
          <rect x="-58" y="62" width="34" height="135" fill="url(#indiaGateGrad)" />
          <rect x="24" y="62" width="34" height="135" fill="url(#indiaGateGrad)" />

          {/* Central Archway */}
          <path
            d="M -24 197 L -24 125 C -24 95, 24 95, 24 125 L 24 197 Z"
            fill="#5C2510"
            opacity="0.85"
          />

          {/* Arch inner depth shadow */}
          <path
            d="M -18 197 L -18 128 C -18 102, 18 102, 18 128 L 18 197 Z"
            fill="#3D180A"
          />

          {/* Base Plinth Steps */}
          <rect x="-66" y="195" width="132" height="6" fill="#8C3F1B" />
          <rect x="-70" y="201" width="140" height="6" fill="#753315" />
        </g>

        {/* Foreground Trees & Green Foliage */}
        <g fill="#235738">
          <circle cx="610" cy="245" r="45" />
          <circle cx="860" cy="240" r="55" />
          <circle cx="560" cy="260" r="40" />
        </g>

        {/* Asphalt Road */}
        <rect x="0" y="240" width="900" height="80" fill="#334155" />
        <line x1="0" y1="240" x2="900" y2="240" stroke="#475569" strokeWidth="3" />
        {/* Road white dashes */}
        <line x1="50" y1="285" x2="130" y2="285" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="30 20" />
        <line x1="180" y1="285" x2="480" y2="285" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="30 20" />
        <line x1="530" y1="285" x2="890" y2="285" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="30 20" />

        {/* Blue Delhi DTC Bus (Positioned on the Right Foreground, driving forward) */}
        <g transform="translate(620, 130)">
          {/* Shadow */}
          <ellipse cx="110" cy="155" rx="125" ry="10" fill="#0F172A" opacity="0.4" />

          {/* Bus Main Chassis (Blue DTC AC Bus from Screenshot 1) */}
          <rect x="15" y="15" width="220" height="125" rx="16" fill="url(#busBodyGrad)" />

          {/* Front Windshield Curved Glass */}
          <path
            d="M 125 22 L 222 25 C 228 25, 232 29, 232 35 L 230 85 L 125 85 Z"
            fill="#0F172A"
          />

          {/* Windshield Reflection */}
          <path d="M 135 28 L 220 30 L 195 78 L 135 78 Z" fill="#38BDF8" opacity="0.25" />

          {/* Windshield Wiper */}
          <line x1="170" y1="80" x2="195" y2="50" stroke="#94A3B8" strokeWidth="2.5" strokeCap="round" />

          {/* Destination LED Board (Delhi Transport) */}
          <rect x="145" y="28" width="75" height="14" rx="2" fill="#091428" />
          <text x="182" y="39" fill="#FBBF24" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            Delhi Transport
          </text>

          {/* Passenger Side Windows */}
          <rect x="28" y="32" width="28" height="52" rx="4" fill="#0F172A" />
          <rect x="62" y="32" width="28" height="52" rx="4" fill="#0F172A" />
          <rect x="96" y="32" width="24" height="52" rx="4" fill="#0F172A" />

          {/* Window Glass Reflections */}
          <path d="M 32 35 L 52 35 L 42 80 L 32 80 Z" fill="#38BDF8" opacity="0.2" />
          <path d="M 66 35 L 86 35 L 76 80 L 66 80 Z" fill="#38BDF8" opacity="0.2" />

          {/* Headlights (White / Amber LED Clusters) */}
          <rect x="218" y="102" width="14" height="10" rx="3" fill="#FEF08A" />
          <circle cx="225" cy="107" r="3" fill="#F59E0B" />

          <rect x="135" y="102" width="14" height="10" rx="3" fill="#FEF08A" />
          <circle cx="142" cy="107" r="3" fill="#F59E0B" />

          {/* Front Grille & Delhi DTC Emblem */}
          <rect x="155" y="102" width="56" height="12" rx="3" fill="#0C4A6E" />
          <circle cx="183" cy="108" r="4" fill="#F8FAFC" />

          {/* Yellow License Plate */}
          <rect x="170" y="118" width="26" height="7" rx="1.5" fill="#EAB308" />
          <rect x="172" y="120" width="22" height="3" fill="#0F172A" opacity="0.7" />

          {/* Wheels with Silver Hubcaps */}
          {/* Rear Wheel */}
          <circle cx="55" cy="140" r="18" fill="#0F172A" />
          <circle cx="55" cy="140" r="10" fill="#64748B" />
          <circle cx="55" cy="140" r="5" fill="#CBD5E1" />

          {/* Front Wheel */}
          <circle cx="195" cy="140" r="18" fill="#0F172A" />
          <circle cx="195" cy="140" r="10" fill="#64748B" />
          <circle cx="195" cy="140" r="5" fill="#CBD5E1" />
        </g>
      </svg>
    </div>
  );
}
