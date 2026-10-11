import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Save, Shield, Clock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { showToast, idle } = useApp();
  const [idleThreshold, setIdleThreshold] = useState<string>('60');
  const [workHours, setWorkHours] = useState<string>('8');
  const [submissionDeadline, setSubmissionDeadline] = useState<string>('Day 25 of every month');
  const [approvalDeadline, setApprovalDeadline] = useState<string>('Day 28 of every month');

  const handleSave = () => {
    showToast('System configuration & workforce policies saved!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Configuration & Policies
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure web timer idle detection thresholds, cycle deadlines, and payroll formulas
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs max-w-2xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Web Timer Idle Detection Threshold
            </label>
            <select
              value={idleThreshold}
              onChange={(e) => setIdleThreshold(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="60">1 Minute (Live Demo / Testing)</option>
              <option value="300">5 Minutes (Standard Industry Level)</option>
              <option value="600">10 Minutes (Extended)</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tracks mouse/keyboard inactivity in the browser tab.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Default Working Hours / Day
            </label>
            <input
              type="number"
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
              min="4"
              max="12"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Monthly Planning Submission Deadline
            </label>
            <select
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="Day 25 of every month">Day 25 of every month</option>
              <option value="Day 28 of every month">Day 28 of every month</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Approval Window Closes
            </label>
            <select
              value={approvalDeadline}
              onChange={(e) => setApprovalDeadline(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="Day 28 of every month">Day 28 of every month</option>
              <option value="Last day of month">Last day of month</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1.5">
              Absence Payroll Deduction Formula (Read-only Standard)
            </label>
            <input
              type="text"
              readOnly
              value="Daily Rate = Base Salary / 30; Deduction = Daily Rate * Unapproved Absent Days"
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-600 outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Save size={13} />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
