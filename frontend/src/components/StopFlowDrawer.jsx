import React, { useEffect, useRef } from 'react';
import {
  X,
  Users,
  UserPlus,
  UserMinus,
  CheckCircle2,
  TrendingUp,
  Database,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { normalizeStopName, formatConfidence } from '../utils/formatters';

export default function StopFlowDrawer({
  isOpen,
  onClose,
  routeId,
  selectedStop,
  flowData,
  onSelectStop,
  hour = 8,
  dayType = 'weekday',
  loading = false,
}) {
  const { t, lang } = useTranslation();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Resolve stops list from flowData
  const stopsList = Array.isArray(flowData?.stops) ? flowData.stops : [];

  // Match the active stop from flowData if available to get freshest metrics
  const activeStop =
    stopsList.find(
      (s) =>
        s.stop_id === selectedStop?.stop_id ||
        s.stop_sequence === selectedStop?.stop_sequence ||
        s.stop_name === selectedStop?.stop_name
    ) || selectedStop || {};

  const stopName = normalizeStopName(activeStop.stop_name || selectedStop?.stop_name || 'Stop');
  const stopSeq =
    activeStop.stop_sequence !== undefined
      ? activeStop.stop_sequence + 1
      : selectedStop?.stop_sequence !== undefined
      ? selectedStop.stop_sequence + 1
      : 1;

  const boardings = typeof activeStop.boardings === 'number' ? activeStop.boardings.toFixed(1) : '—';
  const alightings = typeof activeStop.alightings === 'number' ? activeStop.alightings.toFixed(1) : '—';
  const runningLoad = typeof activeStop.running_load === 'number' ? activeStop.running_load.toFixed(1) : '—';

  const attributionMode =
    activeStop.attribution_mode ||
    (activeStop.alightings > 0 && activeStop.boardings > 0
      ? 'Mode A (Observed O-D)'
      : 'Mode B (Inferred Alightings)');

  const isModeA = String(attributionMode).toLowerCase().includes('mode a');
  const sampleCount = activeStop.sample_ticket_count ?? selectedStop?.sample_ticket_count;
  const confidence = activeStop.confidence || selectedStop?.confidence || 'medium';
  const confidenceText =
    activeStop.confidence_text ||
    formatConfidence(confidence, sampleCount);

  const crowdLevel = activeStop.crowd_level || selectedStop?.crowd_level || 'Not crowded';

  const crowdColorClass =
    crowdLevel.toLowerCase().includes('very') || crowdLevel.toLowerCase().includes('crowd')
      ? 'text-[#C64B4B] bg-red-50 border-red-200'
      : crowdLevel.toLowerCase().includes('fair') || crowdLevel.toLowerCase().includes('stand')
      ? 'text-[#E0A51A] bg-amber-50 border-amber-200'
      : 'text-[#145C3A] bg-emerald-50 border-emerald-200';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Right side on desktop, bottom sheet on mobile) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col h-full border-l border-[#d8e6dd]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#e5ebe7] flex items-start justify-between bg-[#fbfdfc]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#eaf3ed] text-[#004327]">
                  {routeId || flowData?.route_id || 'Route'} · {flowData?.direction || 'UP'}
                </span>
                <span className="text-[11px] font-medium text-[#526359]">
                  Stop #{stopSeq}
                </span>
                <span className="text-[11px] text-[#707971]">
                  {hour !== undefined ? `${String(hour).padStart(2, '0')}:00` : ''} ({dayType})
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#121e19] leading-tight">
                {stopName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#707971] hover:text-[#121e19] hover:bg-[#edf2ee] transition-colors"
              aria-label={t('flow.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Loading state */}
            {loading && (
              <div className="py-8 text-center text-sm text-[#526359] animate-pulse">
                {t('flow.loading', 'Loading stop flow...')}
              </div>
            )}

            {/* 3 Metric Cards Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Boardings */}
              <div className="bg-[#f7faf8] border border-[#d8e6dd] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[#136c46] mb-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">
                    {t('flow.boardings', 'Boardings')}
                  </span>
                </div>
                <div className="text-xl font-bold text-[#121e19]">
                  {boardings}
                </div>
                <span className="text-[10px] text-[#707971]">avg / trip</span>
              </div>

              {/* Alightings */}
              <div className="bg-[#f7faf8] border border-[#d8e6dd] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-[#b45309] mb-1">
                  <UserMinus className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">
                    {t('flow.alightings', 'Alightings')}
                  </span>
                </div>
                <div className="text-xl font-bold text-[#121e19]">
                  {alightings}
                </div>
                <span className="text-[10px] text-[#707971]">avg / trip</span>
              </div>

              {/* Running Load */}
              <div className="bg-[#004327] text-white rounded-xl p-3 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-emerald-200 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">
                    {t('flow.runningLoad', 'Running Load')}
                  </span>
                </div>
                <div className="text-xl font-bold text-white">
                  {runningLoad}
                </div>
                <span className="text-[10px] text-emerald-200">onboard load</span>
              </div>
            </div>

            {/* Physical Conservation Verified Banner */}
            <div className="bg-[#f0f8f3] border border-[#c2e4cf] rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006b3f] shrink-0 mt-0.5" />
              <div className="text-xs text-[#121e19]">
                <div className="font-bold text-[#004327]">
                  {t('flow.conservationVerified', 'Physical Flow Conservation Verified')}
                </div>
                <p className="font-mono text-[11px] text-[#2d523e] mt-0.5">
                  Load = max(0, Previous Load + Boardings - Alightings)
                </p>
              </div>
            </div>

            {/* Attribution Mode Box */}
            <div className="bg-white border border-[#d8e6dd] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#121e19]">
                  <Layers className="w-3.5 h-3.5 text-[#136c46]" />
                  <span>{t('flow.attributionMode', 'Attribution method')}</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isModeA
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}
                >
                  {isModeA ? t('flow.modeA', 'Mode A (Observed O-D)') : t('flow.modeB', 'Mode B (Inferred Alightings)')}
                </span>
              </div>
              <p className="text-xs text-[#526359] leading-relaxed">
                {isModeA
                  ? t('flow.modeAExplanation', 'Directly observed passenger origin-destination ticketing telemetry')
                  : t('flow.modeBExplanation', 'Alightings inferred via reverse-corridor flow and spatial gravity decay')}
              </p>
            </div>

            {/* Data Confidence & Sample Records */}
            <div className="bg-[#fafcfa] border border-[#d8e6dd] rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#136c46]" />
                <div>
                  <div className="text-xs font-bold text-[#121e19]">
                    {confidenceText}
                  </div>
                  {sampleCount !== undefined && (
                    <div className="text-[11px] text-[#707971]">
                      {sampleCount} {t('flow.sampleRecords', 'ticket records')}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${crowdColorClass}`}
              >
                {crowdLevel}
              </span>
            </div>

            {/* Corridor Progression Mini-Timeline */}
            {stopsList.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-[#121e19] uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Corridor Sequence</span>
                  <span className="text-[11px] text-[#707971] font-normal">
                    {stopsList.length} stops
                  </span>
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 border border-[#e5ebe7] rounded-xl p-2 bg-[#fcfdfc]">
                  {stopsList.map((stop, idx) => {
                    const isCurrent =
                      stop.stop_id === activeStop.stop_id ||
                      stop.stop_sequence === activeStop.stop_sequence;
                    return (
                      <button
                        key={stop.stop_id || idx}
                        type="button"
                        onClick={() => onSelectStop && onSelectStop(stop)}
                        className={`w-full text-left flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#004327] text-white font-semibold shadow-2xs'
                            : 'hover:bg-[#eaf3ed] text-[#121e19]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                              isCurrent
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#e5ebe7] text-[#526359]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">
                            {normalizeStopName(stop.stop_name)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2 text-[11px]">
                          <span
                            className={
                              isCurrent ? 'text-emerald-200' : 'text-[#707971]'
                            }
                          >
                            Load: {typeof stop.running_load === 'number' ? stop.running_load.toFixed(0) : '—'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#e5ebe7] bg-[#fbfdfc] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#004327] text-white rounded-xl text-xs font-semibold hover:bg-[#00341e] transition-colors"
            >
              {t('flow.close', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
