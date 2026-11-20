import React from 'react';
import { Clock, Lightbulb, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { formatTime12h } from '../utils/formatters';

const OFFSETS = [0, 15, 30, 45, 60];

function calculateShiftedTime(baseTime, offsetMinutes) {
  if (!baseTime || baseTime === 'now') {
    const now = new Date();
    const d = new Date(now.getTime() + offsetMinutes * 60000);
    return formatTime12h(d);
  }

  const parts = String(baseTime).trim().split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10) || 0;
    let minutes = parseInt(parts[1], 10) || 0;
    let totalMinutes = (hours * 60 + minutes + offsetMinutes) % 1440;
    if (totalMinutes < 0) totalMinutes += 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return formatTime12h(`${h}:${m.toString().padStart(2, '0')}`);
  }

  return '';
}

export default function DepartureScrubber({
  baseTime = '18:00',
  selectedOffset = 0,
  onOffsetChange,
  departureTips = [],
  loading = false,
  className = '',
}) {
  const { t } = useTranslation();

  const tipsList = Array.isArray(departureTips)
    ? departureTips.filter(Boolean)
    : departureTips
    ? [String(departureTips)]
    : [];

  return (
    <div className={`bg-white border border-[#d8e6dd] rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Title & Icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#004327]" />
          <h2 className="text-sm font-semibold text-[#121e19]">
            {t('scrubber.title', 'Adjust departure time')}
          </h2>
        </div>
      </div>

      {/* Button Group */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {OFFSETS.map((offset) => {
          const isActive = selectedOffset === offset;
          const shiftedTime = calculateShiftedTime(baseTime, offset);

          let labelKey = `scrubber.offset${offset}`;
          let labelText = `+${offset}m`;
          if (offset === 0) {
            labelText = t('scrubber.offset0', '+0m');
          }

          return (
            <button
              key={offset}
              type="button"
              disabled={loading}
              onClick={() => onOffsetChange && onOffsetChange(offset)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 text-center ${
                isActive
                  ? 'bg-[#004327] text-white shadow-xs font-semibold ring-2 ring-[#004327] ring-offset-1'
                  : 'bg-[#f4f7f5] text-[#2d3a33] hover:bg-[#e9f7ee] hover:text-[#004327] border border-transparent'
              } ${loading ? 'opacity-80 cursor-wait' : 'cursor-pointer'}`}
            >
              <span className="text-xs sm:text-sm font-bold leading-tight">
                {offset === 0 ? t('scrubber.departNow', 'Now') : labelText}
              </span>
              {shiftedTime && (
                <span
                  className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${
                    isActive ? 'text-emerald-100' : 'text-[#707971]'
                  }`}
                >
                  {shiftedTime}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Departure Tips Callout */}
      {tipsList.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-[#e9f0ec] flex items-start gap-2.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
          <Lightbulb className="w-4 h-4 text-[#136c46] shrink-0 mt-0.5" />
          <div className="text-xs text-[#121e19] flex-1">
            <span className="font-semibold text-[#004327] block mb-0.5">
              {t('scrubber.tipsTitle', 'Departure Tips')}
            </span>
            <ul className="space-y-1">
              {tipsList.map((tip, idx) => (
                <li key={idx} className="leading-snug">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
