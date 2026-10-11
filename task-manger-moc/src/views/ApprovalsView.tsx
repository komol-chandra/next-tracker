import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  CalendarCheck,
  Send,
  Eye,
  Check
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { openModal, showToast, triggerRefresh } = useApp();
  const [tab, setTab] = useState<'plans' | 'timesheets' | 'leaves'>('plans');

  const [plans, setPlans] = useState([
    {
      id: 'plan-101',
      rep: 'Ravi Kumar',
      designation: 'Field Sales (SO)',
      tasksCount: 12,
      target: '180 Outlets · ৳ 750,000 Collection',
      status: 'Pending Review'
    },
    {
      id: 'plan-102',
      rep: 'Nadia Rahman',
      designation: 'Field Sales (ASE)',
      tasksCount: 15,
      target: '210 Outlets · ৳ 900,000 Collection',
      status: 'Pending Review'
    }
  ]);

  const [timesheets, setTimesheets] = useState([
    {
      id: 'ts-201',
      rep: 'Tanvir Ahmed',
      week: 'Week 37 (Sep 07-13)',
      hours: 38.5,
      idleFlags: 0,
      status: 'Pending Review'
    },
    {
      id: 'ts-202',
      rep: 'Ravi Kumar',
      week: 'Week 37 (Sep 07-13)',
      hours: 39.0,
      idleFlags: 0,
      status: 'Pending Review'
    }
  ]);

  const [leaves, setLeaves] = useState([
    {
      id: 'leave-301',
      applicant: 'Sadia Islam',
      dept: 'Marketing',
      type: 'Sick Leave',
      duration: '1 Day',
      dates: 'Sep 21, 2026',
      reason: 'Severe viral fever and clinical consultation at Square Hospital.',
      status: 'Pending HR'
    }
  ]);

  const handleApprovePlan = (rep: string) => {
    setPlans(prev => prev.filter(p => p.rep !== rep));
    showToast(`Monthly plan for ${rep} APPROVED!`);
    triggerRefresh();
  };

  const handleApproveTimesheet = (rep: string, hours: number) => {
    setTimesheets(prev => prev.filter(t => t.rep !== rep));
    showToast(`Timesheet for ${rep} (${hours}h) APPROVED!`);
    triggerRefresh();
  };

  const handleApproveLeave = (applicant: string) => {
    setLeaves(prev => prev.filter(l => l.applicant !== applicant));
    showToast(`Paid leave application for ${applicant} APPROVED!`);
    triggerRefresh();
  };

  const handleBatchApproveTimesheets = () => {
    setTimesheets([]);
    showToast('All weekly timesheets batch approved and locked for payroll!');
    triggerRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manager & HR Approvals Inbox
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review monthly team plans, approve logged timesheet hours, and authorize leave requests
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBatchApproveTimesheets}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Check size={14} />
            <span>Batch Approve Timesheets</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit border border-slate-200">
        <button
          onClick={() => setTab('plans')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'plans'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Monthly Plans ({plans.length})
        </button>
        <button
          onClick={() => setTab('timesheets')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'timesheets'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Timesheet Hours ({timesheets.length})
        </button>
        <button
          onClick={() => setTab('leaves')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'leaves'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leave Applications ({leaves.length})
        </button>
      </div>

      {/* Tab 1: Monthly Plans */}
      {tab === 'plans' && (
        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <b>All monthly team plans have been reviewed and approved!</b>
            </div>
          ) : (
            plans.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{p.rep}</span>
                    <span className="text-slate-500 font-semibold">&middot; {p.designation}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">{p.target}</div>
                  <div className="text-[11px] text-slate-400 font-semibold">{p.tasksCount} Planned Tasks Allocated</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal('planReview', { repName: p.rep })}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    Review Plan Tasks
                  </button>
                  <button
                    onClick={() => handleApprovePlan(p.rep)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>Approve Plan</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Timesheets */}
      {tab === 'timesheets' && (
        <div className="space-y-3">
          {timesheets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <b>All weekly timesheets are approved and locked for payroll export!</b>
            </div>
          ) : (
            timesheets.map((t) => (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{t.rep}</span>
                    <span className="text-slate-500 font-semibold">&middot; {t.week}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    <b className="text-emerald-800">{t.hours} Logged Hours</b> &middot; {t.idleFlags} flagged idle sessions (Verified via Web Timer)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal('timesheetInspect', { repName: t.rep })}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    Inspect Daily Logs
                  </button>
                  <button
                    onClick={() => handleApproveTimesheet(t.rep, t.hours)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>Approve {t.hours}h</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Leaves */}
      {tab === 'leaves' && (
        <div className="space-y-3">
          {leaves.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600 mb-2" />
              <b>No pending leave applications to review.</b>
            </div>
          ) : (
            leaves.map((l) => (
              <div
                key={l.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{l.applicant}</span>
                    <span className="text-slate-500 font-semibold">({l.dept}) &middot; {l.type}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {l.status}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    Date: {l.dates} &middot; Duration: {l.duration} &middot; Reason: {l.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal('leaveInspect', { applicantName: l.applicant })}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    Inspect & Review
                  </button>
                  <button
                    onClick={() => handleApproveLeave(l.applicant)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>Approve Paid Leave</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
