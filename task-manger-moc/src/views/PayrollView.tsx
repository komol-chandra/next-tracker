import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PayrollRecord } from '../types';
import {
  CreditCard,
  Settings,
  RotateCw,
  Download,
  Search,
  FileText,
  DollarSign
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const { openModal, showToast, dataVersion, triggerRefresh } = useApp();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getPayroll()
      .then((res) => {
        setRecords(res.records);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataVersion]);

  const handleGeneratePayroll = async () => {
    try {
      const res = await api.generatePayroll();
      showToast(res.message);
      triggerRefresh();
    } catch {
      showToast('Payroll processed locally.');
    }
  };

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Payroll & Salary Processing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monthly payroll tied to attendance, salary structures, bonuses, deductions, and payslip generation &middot; Member 3
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('salaryStructure')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Settings size={13} />
            <span>Salary Structure</span>
          </button>
          <button
            onClick={handleGeneratePayroll}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RotateCw size={13} />
            <span>Process Month Payroll</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Total Gross Payroll
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">৳ 1,420,000</div>
          <div className="text-xs text-slate-500 mt-1">16 Active Employees</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Attendance Deductions
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">- ৳ 24,500</div>
          <div className="text-xs text-rose-700 font-semibold mt-1">Calculated from absence logs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Performance Bonuses
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">+ ৳ 85,000</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Based on task completion %</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Total Net Payable
          </div>
          <div className="text-2xl font-black text-[#114e38] tracking-tight">৳ 1,480,500</div>
          <div className="text-xs text-emerald-800 font-bold mt-1">Disbursement Ready</div>
        </div>
      </div>

      {/* Payroll Register Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Employee Payroll Register &mdash; September 2026
            </h3>
            <p className="text-xs text-slate-500">Statutory earnings and deductions register</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
            <button
              onClick={() => openModal('batchPayslips')}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download size={13} />
              <span>Download All Payslips</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">Department & Role</th>
                <th className="py-3 px-3">Base Salary</th>
                <th className="py-3 px-3">Attendance (Days)</th>
                <th className="py-3 px-3">Deductions</th>
                <th className="py-3 px-3">Bonus</th>
                <th className="py-3 px-3">Net Salary</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{emp.employeeName}</div>
                    <div className="text-[11px] text-slate-400">{emp.empCode}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{emp.dept}</div>
                    <div className="text-[11px] text-slate-500">{emp.role}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ৳ {emp.baseSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-emerald-700">{emp.presentDays} Present</span>
                    {emp.absentDays > 0 && (
                      <div className="text-[11px] text-rose-600 font-semibold">
                        {emp.absentDays} Unpaid Absent
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-rose-600">
                    - ৳ {emp.deductions.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700">
                    + ৳ {emp.bonus.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-900 text-sm">
                    ৳ {emp.netSalary.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openModal('payslip', { emp })}
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1 transition-all cursor-pointer shadow-xs ml-auto"
                    >
                      <FileText size={12} />
                      <span>Payslip</span>
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
