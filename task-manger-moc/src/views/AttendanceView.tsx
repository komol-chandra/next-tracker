import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { AttendanceRecord } from '../types';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { openModal, punchState, dataVersion } = useApp();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getAttendance()
      .then((res) => {
        setRecords(res.records);
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
            HR & Daily Attendance Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daily check-in/out logs, attendance summary, and leave requests with approval workflow &middot; Member 3
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('applyLeave')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <span>Request Leave</span>
          </button>
          <button
            onClick={() => openModal('clock')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Clock size={14} />
            <span>Clock In / Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Today&apos;s Status
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              punchState.clockedIn ? 'text-emerald-800' : 'text-slate-500'
            }`}
          >
            {punchState.clockedIn ? 'Present' : 'Clocked Out'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            In: {punchState.clockInTime} &middot; Out: {punchState.clockOutTime || '--'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Present Days (Month)
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">20 Days</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">0 unexcused late days</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Approved Leaves
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">1 Day</div>
          <div className="text-xs text-slate-500 mt-1">Casual Leave (Fully Paid)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Leave Balance Remaining
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">14 Days</div>
          <div className="text-xs text-slate-500 mt-1">Annual: 9 &middot; Sick: 5</div>
        </div>
      </div>

      {/* Register Table & HR Payroll Rule Note */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Monthly Attendance Register (September 2026)
              </h3>
              <p className="text-xs text-slate-500">Audited timestamps captured from web attendance punch</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Present</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Late</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Absent</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Clock In</th>
                  <th className="py-3 px-3">Clock Out</th>
                  <th className="py-3 px-3">Work Duration</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Location / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.date}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{r.clockIn}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{r.clockOut || '--'}</td>
                    <td className="py-3 px-3 font-bold text-emerald-800">{r.duration}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          r.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Leave'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="font-semibold text-slate-700">{r.location}:</span> {r.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HR Payroll Rules & Active Leave Requests Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Active Leave Summary</h3>
              <button
                onClick={() => openModal('applyLeave')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Apply
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Casual Leave (Personal)</div>
                  <div className="text-[11px] text-slate-500">Mon, 07 Sep &middot; 1 Day</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Approved
                </span>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Medical / Sick Leave</div>
                  <div className="text-[11px] text-slate-500">Mon, 21 Sep &middot; 1 Day</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Pending HR
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 text-xs leading-relaxed text-emerald-950">
            <div className="font-extrabold text-sm mb-1 text-emerald-900 flex items-center gap-1.5">
              <FileText size={15} />
              <span>HR Attendance & Payroll Linking</span>
            </div>
            <p className="mt-1 text-emerald-800 text-[11px]">
              Daily attendance logs directly dictate monthly payroll calculations. Unexcused absence days calculate an automatic wage deduction based on:
              <br />
              <code className="inline-block mt-1.5 font-mono font-bold bg-white px-2 py-1 rounded border border-emerald-300 text-emerald-900">
                Daily Rate = Base Salary / 30
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
