import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Clock,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
  BarChart2
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Performance & Aggregation Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated metrics across members, teams, and departments: hours logged, completion %, attendance
          </p>
        </div>
        <button
          onClick={() => {
            window.print();
            showToast('Opening print dialog / PDF export');
          }}
          className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Printer size={14} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Total Hours Logged
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">1,248 hrs</div>
          <div className="text-xs text-slate-500 mt-1">Across 16 active members</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Task Completion Rate
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">84.2%</div>
          <div className="text-xs text-slate-500 mt-1">312 of 370 tasks completed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Attendance Average
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">96.5%</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Target: 95.0%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Avg Hourly Output
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">৳ 3,600 / hr</div>
          <div className="text-xs text-slate-500 mt-1">Operational revenue roll-up</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departmental Hours & Productivity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Departmental Hours & Productivity
            </h3>
            <p className="text-xs text-slate-500">Distribution of operational hours across teams</p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Field Sales Department</span>
                <span className="font-extrabold text-slate-900">540 hrs (90%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-700 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Engineering & Tech</span>
                <span className="font-extrabold text-slate-900">420 hrs (78%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Marketing & Growth</span>
                <span className="font-extrabold text-slate-900">180 hrs (62%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Admin & HR Operations</span>
                <span className="font-extrabold text-slate-900">108 hrs (45%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Outcome Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Task Outcome Distribution
            </h3>
            <p className="text-xs text-slate-500">Verified monthly plan achievements</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            <div className="relative w-36 h-36 rounded-full border-10 border-emerald-700 border-t-amber-400 border-l-rose-500 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">370</div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Total Tasks
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-700 shrink-0"></span>
                <span className="text-slate-600">Achieved Quota:</span>
                <b className="text-slate-900 font-extrabold">68% (252 Tasks)</b>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span>
                <span className="text-slate-600">Partially Achieved:</span>
                <b className="text-slate-900 font-extrabold">20% (74 Tasks)</b>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-slate-600">Not Achieved / Delayed:</span>
                <b className="text-slate-900 font-extrabold">12% (44 Tasks)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
