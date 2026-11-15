import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';

export function normalizeCrowdCategory(rawCategory) {
  if (!rawCategory) return 'unknown';
  const c = String(rawCategory).toLowerCase();
  if (c.includes('seat') || c.includes('low') || c.includes('not crowded') || c.includes('कम')) {
    return 'low';
  }
  if (c.includes('stand') || c.includes('mod') || c.includes('fairly') || c.includes('मध्यम')) {
    return 'moderate';
  }
  if (c.includes('crowd') || c.includes('high') || c.includes('very') || c.includes('ज़्यादा')) {
    return 'high';
  }
  return 'unknown';
}

function PersonIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6.5A5.5 5.5 0 018.5 9h-1A5.5 5.5 0 002 14.5v.5h6v-1H3v.5z" />
      <path d="M8 9a5.5 5.5 0 015.5 5.5v.5h-11v-.5A5.5 5.5 0 018 9z" />
    </svg>
  );
}

export default function CrowdIndicator({
  category = 'low',
  showLabel = true,
  qualifier = null,
  size = 'md',
  className = '',
}) {
  const { lang } = useTranslation();
  const normalized = normalizeCrowdCategory(category);

  const configs = {
    low: {
      count: 1,
      color: 'text-emerald-700',
      labelEn: 'Not crowded',
      labelHi: 'कम भीड़',
    },
    moderate: {
      count: 2,
      color: 'text-amber-600',
      labelEn: 'Fairly crowded',
      labelHi: 'मध्यम भीड़',
    },
    high: {
      count: 3,
      color: 'text-red-600',
      labelEn: 'Very crowded',
      labelHi: 'बहुत भीड़',
    },
    unknown: {
      count: 0,
      color: 'text-slate-500',
      labelEn: 'Not enough data',
      labelHi: 'पर्याप्त डेटा नहीं',
    },
  };

  const current = configs[normalized] || configs.unknown;
  const labelText = lang === 'hi' ? current.labelHi : current.labelEn;

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${current.color} ${className}`}>
      {/* 1, 2, or 3 Person Icons matching screenshots */}
      {current.count > 0 && (
        <div className="flex items-center -space-x-1" aria-hidden="true">
          {Array.from({ length: current.count }).map((_, i) => (
            <PersonIcon key={i} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          ))}
        </div>
      )}

      {/* Label */}
      {showLabel && (
        <span className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {labelText}
          {qualifier && <span className="font-normal text-slate-500 text-xs ml-1">· {qualifier}</span>}
        </span>
      )}
    </div>
  );
}
