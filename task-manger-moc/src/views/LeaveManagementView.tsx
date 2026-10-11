import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { LeaveRequest, LeaveBalance, Holiday } from '../types';
import {
  CalendarCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  ShieldCheck,
  Info
} from 'lucide-react';

export const LeaveManagementView: React.FC = () => {
  const { openModal, showToast, currentRole, dataVersion, triggerRefresh } = useApp();
  const [tab, setTab] = useState<'requests' | 'holidays' | 'balances'>('requests');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const canApprove = currentRole === 'Super Admin' || currentRole === 'Admin' || currentRole === 'HR' || currentRole === 'Manager';

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getLeaves(), api.getHolidays()])
      .then(([leavesRes, holidaysRes]) => {
        setLeaves(leavesRes.leaves);
        setBalance(leavesRes.balance);
        setHolidays(holidaysRes.holidays);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataVersion]);

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected', remarks?: string) => {
    try {
      await api.updateLeaveStatus(id, status, remarks);
      showToast(`Leave application marked as ${status}!`);
      triggerRefresh();
    } catch {
      showToast('Status updated locally.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Leave & Holiday Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Applications, approval workflow, remaining quotas, and official holiday calendar &middot; Member 1: Adhara Paul
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('applyLeave')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Balance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Casual Leave</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {balance ? balance.casualTotal - balance.casualUsed : 9} Days Left
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Total Allowance: {balance?.casualTotal || 10} &middot; Used: {balance?.casualUsed || 1}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sick Leave</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Medical</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {balance ? balance.sickTotal - balance.sickUsed : 6} Days Left
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Total Allowance: {balance?.sickTotal || 7} &middot; Used: {balance?.sickUsed || 1}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Annual Leave</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Paid</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {balance ? balance.annualTotal - balance.annualUsed : 15} Days Left
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Total Allowance: {balance?.annualTotal || 15} &middot; Used: {balance?.annualUsed || 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Unpaid Leave (LOP)</span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Penalty</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {balance?.unpaidUsed || 0} Days Taken
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Subject to statutory base salary deduction
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit border border-slate-200">
        <button
          onClick={() => setTab('requests')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'requests'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leave Applications & History
        </button>
        <button
          onClick={() => setTab('holidays')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'holidays'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Holidays Calendar 2026
        </button>
        <button
          onClick={() => setTab('balances')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'balances'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Company Leave Policies & Rules
        </button>
      </div>

      {/* Tab 1: Leave Applications & History */}
      {tab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Leave Applications Register
              </h3>
              <p className="text-xs text-slate-500">
                Track status across Supervisor review and HR authorization stages
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {leaves.map((leave) => {
              const isApproved = leave.status === 'Approved';
              const isRejected = leave.status === 'Rejected';
              const isPending = !isApproved && !isRejected;

              return (
                <div
                  key={leave.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{leave.applicantName}</span>
                      <span className="text-[11px] text-slate-500">({leave.dept})</span>
                      <span className="font-semibold text-slate-600">&middot; {leave.type}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    <div className="text-slate-600 font-medium">
                      Reason: <span className="text-slate-800">{leave.reason}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <Calendar size={12} /> {leave.startDate} to {leave.endDate} ({leave.duration})
                      </span>
                      <span>Applied: {leave.appliedAt}</span>
                      {leave.approvedBy && (
                        <span className="text-emerald-700 font-semibold">
                          Authorized by: {leave.approvedBy}
                        </span>
                      )}
                    </div>

                    {leave.certificateAttachment && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md mt-1">
                        <FileText size={12} />
                        <span>Attached Certificate: {leave.certificateAttachment}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Manager / HR */}
                  {canApprove && isPending && (
                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve Paid</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Holidays Calendar */}
      {tab === 'holidays' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Official Company & National Holidays (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled non-working days for payroll attendance calculation
              </p>
            </div>
            {canApprove && (
              <button
                onClick={() => openModal('addHoliday')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-emerald-800 hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                + Add Holiday
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all bg-slate-50/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      h.type === 'National'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {h.type} Holiday
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{h.day}</span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">{h.title}</div>
                <div className="text-xs text-emerald-800 font-bold mt-1">{h.date}</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">{h.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Policy & Rules */}
      {tab === 'balances' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs max-w-3xl space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">Workforce Leave & Absence Policies</h3>
            <p className="text-xs text-slate-500">Statutory and company guidelines for Bangladesh operations</p>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="font-extrabold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>Paid Leave Eligibility & Encashment</span>
              </div>
              <p>
                Every regular employee receives 10 days Casual Leave, 7 days Medical/Sick Leave, and 15 days Annual Leave per fiscal year. Approved paid leaves do not trigger attendance payroll deductions.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="font-extrabold text-amber-950 text-sm mb-1 flex items-center gap-1.5">
                <AlertCircle size={16} className="text-amber-700" />
                <span>Absence Deduction Formula</span>
              </div>
              <p>
                Unapproved absences or unpaid leaves (Loss of Pay) incur automatic salary deductions calculated as:
                <br />
                <code className="inline-block mt-1 font-mono font-bold bg-white px-2 py-1 rounded border border-amber-300 text-amber-950">
                  Deduction = (Base Salary / 30) &times; Unapproved Absent Days
                </code>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-extrabold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-slate-700" />
                <span>Medical Certificate Requirement</span>
              </div>
              <p>
                Sick leaves exceeding 1 continuous day require an attached medical prescription or clinical certificate from an authorized healthcare institution prior to HR disbursement clearance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
