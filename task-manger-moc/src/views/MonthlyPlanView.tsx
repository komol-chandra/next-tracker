import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MonthlyPlan } from '../types';
import {
  Target,
  Plus,
  RotateCw,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Users,
  Eye
} from 'lucide-react';

export const MonthlyPlanView: React.FC = () => {
  const { openModal, showToast, dataVersion } = useApp();
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getMonthlyPlans()
      .then((res) => {
        setPlans(res.plans);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataVersion]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Work Planning & Targets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department targets, MonthlyPlan goals, assigned quotas, and completion roll-up % &middot; Member 2
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('newPlan')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Set Team Monthly Plan</span>
          </button>
          <button
            onClick={() => openModal('recalculateRollup')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCw size={13} className="text-emerald-700" />
            <span>Recalculate %</span>
          </button>
        </div>
      </div>

      {/* Strategic Target KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Monthly Revenue Target
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">৳ 4.5M</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            ৳ 3.2M Achieved (71%)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Outlet Coverage Goal
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">450 Outlets</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            380 Covered (84%)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Collection Target
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">৳ 1.8M</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            ৳ 1.5M Recovered
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Overall Team Roll-Up
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">78.4%</div>
          <div className="text-xs text-slate-500 mt-1">Weighted across 16 reps</div>
        </div>
      </div>

      {/* Team Plans Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Team Monthly Goals & Progress Breakdown
            </h3>
            <p className="text-xs text-slate-500">Cycle: September 2026 Monthly Target Allocations</p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Cycle Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">Department / Team</th>
                <th className="py-3 px-4 min-w-[200px]">Strategic Target Objective</th>
                <th className="py-3 px-3">Assigned Reps</th>
                <th className="py-3 px-3">Total Tasks</th>
                <th className="py-3 px-3">Target Quota</th>
                <th className="py-3 px-4 min-w-[140px]">Progress Roll-Up</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{p.team}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{p.dept}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.targetObjective}</td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{p.repsCount}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{p.tasksCount} tasks</td>
                  <td className="py-3 px-3 font-semibold text-slate-600">{p.targetQuantity}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${p.progressRollup}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-emerald-800 w-8 text-right">
                        {p.progressRollup}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        p.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'In Progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openModal('teamPlanBreakdown', { teamName: p.team })}
                      className="text-xs font-bold px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
