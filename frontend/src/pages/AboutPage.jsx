import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import CrowdIndicator from '../components/primitives/CrowdIndicator';
import { useTranslation } from '../i18n/LanguageContext';

export default function AboutPage() {
  const { lang } = useTranslation();

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-8 text-slate-800">
      {/* Title & Introduction matching Screenshot 4 */}
      <div className="space-y-1.5 border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Data and method
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          CrowdWise shows how crowded a bus usually is at the time you travel. This page explains where the numbers come from and what they cannot tell you.
        </p>
      </div>

      {/* Section 1: What the estimates are based on */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          What the estimates are based on
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ticket records from the Delhi bus system: handheld machine (ETM) tickets and e-tickets, covering about five weeks. Routes, stops and scheduled times come from the public Delhi bus timetable.
        </p>

        {/* Horizontal Pipeline Diagram matching Screenshot 4 */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center gap-1.5 min-w-[700px] text-xs">
            {/* Box 1 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Ticket records</span>
              <span className="text-[10px] text-slate-500 block">ETM, e-tickets</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Box 2 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Cleaning</span>
              <span className="text-[10px] text-slate-500 block">duplicates out</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Box 3 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Flow estimate</span>
              <span className="text-[10px] text-slate-500 block">per stop, per trip</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Box 4 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Model</span>
              <span className="text-[10px] text-slate-500 block">learns patterns</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Box 5 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Crowd level</span>
              <span className="text-[10px] text-slate-500 block">low to high</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            {/* Box 6 */}
            <div className="bg-white border border-slate-200 rounded p-2.5 text-center flex-1 shadow-2xs">
              <span className="font-bold text-slate-900 block text-[11px]">Planner</span>
              <span className="text-[10px] text-slate-500 block">options + tips</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Where each number comes from */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">
          Where each number comes from
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">SOURCE</th>
                <th className="py-2.5 px-3">WHAT IT IS</th>
                <th className="py-2.5 px-3">WHERE YOU SEE IT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Timetable</td>
                <td className="py-2.5 px-3 text-slate-700">Public bus timetable: routes, stops, scheduled times</td>
                <td className="py-2.5 px-3 text-slate-500">Journey options, stop list, map</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Ticket data</td>
                <td className="py-2.5 px-3 text-slate-700">Ticket records supplied by the organizers</td>
                <td className="py-2.5 px-3 text-slate-500">Crowd levels and graphs</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-slate-900">Estimated</td>
                <td className="py-2.5 px-3 text-slate-700">Worked out by the model from past patterns</td>
                <td className="py-2.5 px-3 text-slate-500">Crowd levels, leave-earlier tips</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: What the crowd levels mean */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">
          What the crowd levels mean
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">LEVEL</th>
                <th className="py-2.5 px-3">MEANING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <CrowdIndicator category="low" size="sm" />
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Lower than about half of all route and hour slots in the data
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <CrowdIndicator category="moderate" size="sm" />
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  In the middle range of the data
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <CrowdIndicator category="high" size="sm" />
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  Among the busiest slots in the data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500">
          The cut-off points are our own choice and may change. Levels compare slots with each other. They are not a count of seats.
        </p>
      </section>

      {/* Section 4: How well it works */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-slate-900">
          How well it works
        </h2>
        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">METHOD</th>
                <th className="py-2.5 px-3">ERROR ON UNSEEN DAYS</th>
                <th className="py-2.5 px-3">RANKING MATCH</th>
                <th className="py-2.5 px-3">LEVEL MATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Simple average</td>
                <td className="py-2.5 px-3 text-slate-600 tabular-nums">0.31</td>
                <td className="py-2.5 px-3 text-slate-600 tabular-nums">0.62</td>
                <td className="py-2.5 px-3 text-slate-600 tabular-nums font-medium">56%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-blue-900">Random Forest</td>
                <td className="py-2.5 px-3 text-emerald-700 tabular-nums font-semibold">0.24</td>
                <td className="py-2.5 px-3 text-emerald-700 tabular-nums font-semibold">0.74</td>
                <td className="py-2.5 px-3 text-emerald-700 tabular-nums font-bold">67%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500">
          Sample cases in this mockup. The real page shows results on the final week of data that the model never saw.
        </p>

        {/* 3 Validation Check Results matching Screenshot 4 */}
        <div className="border border-slate-200 rounded-md bg-white divide-y divide-slate-100 text-xs">
          <div className="p-2.5 flex items-center gap-2.5">
            <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Pass
            </span>
            <span className="text-slate-700">
              Weekday morning and evening are busier than midday and late night
            </span>
          </div>

          <div className="p-2.5 flex items-center gap-2.5">
            <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
              Pass
            </span>
            <span className="text-slate-700">
              Weekdays are busier than Sundays across the network
            </span>
          </div>

          <div className="p-2.5 flex items-center gap-2.5">
            <span className="font-bold text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
              Review
            </span>
            <span className="text-slate-700">
              Direction pattern on commuter routes: morning inbound, evening outbound
            </span>
          </div>
        </div>
      </section>

      {/* Section 5: What it cannot tell you */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-slate-900">
          What it cannot tell you
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 pl-1">
          <li>Tickets are not passengers. Some riders, such as free-travel or pass holders, may be missing or counted differently.</li>
          <li>The data may cover only part of all travel, so levels are relative, not exact.</li>
          <li>Times are scheduled, not live. Crowd levels are typical for that hour, not a count on one bus.</li>
          <li>Routes with little data show "Not enough data".</li>
        </ul>
      </section>

      {/* Section 6: Terms */}
      <section className="space-y-2 border-t border-slate-200 pt-4">
        <h2 className="text-sm font-bold text-slate-900">
          Terms
        </h2>
        <div className="space-y-1.5 text-xs text-slate-600">
          <p>
            <strong className="text-slate-900">ETM:</strong> the handheld machine conductors use to issue tickets.
          </p>
          <p>
            <strong className="text-slate-900">Scheduled:</strong> taken from the timetable.
          </p>
          <p>
            <strong className="text-slate-900">Typical:</strong> the usual level for that route, day type and hour.
          </p>
          <p>
            <strong className="text-slate-900">RCI:</strong> Relative Crowding Index, a normalized 0–100 indicator comparing passenger load across hours.
          </p>
          <p>
            <strong className="text-slate-900">DTC Pink Pass:</strong> Fare-free single-journey travel passes issued to female commuters under Delhi Government policy.
          </p>
        </div>
      </section>
    </div>
  );
}
