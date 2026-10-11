import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Bell } from 'lucide-react';
import { Role } from '../../types';

export const Topbar: React.FC = () => {
  const {
    activeView,
    toggleSidebar,
    currentRole,
    switchRole,
    punchState,
    openModal,
    unreadNotifsCount,
    currentUser
  } = useApp();

  const viewTitles: { [key: string]: string } = {
    dashboard: 'Workforce Overview & Executive KPIs',
    timer: 'Web Time Tracker & Timesheets',
    leaves: 'Leave & Holiday Management',
    tasks: 'Monthly Plan Tasks & Assignments',
    'monthly-plan': 'Monthly Team Work Planning',
    attendance: 'HR Daily Attendance & Clock Register',
    approvals: 'Manager & HR Approvals Inbox',
    payroll: 'Payroll Register & Salary Processing',
    reports: 'Performance Analytics & Productivity Reports',
    'user-report': 'User-wise Task & Proof Verification Log',
    'org-rbac': 'Organization Hierarchy & Spatie RBAC',
    'task-types': 'Master Task Presets & SOP Templates',
    settings: 'System Configuration & Work Policies'
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-emerald-900 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-all cursor-pointer"
          title="Toggle Navigation Sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:block">
          <div className="text-xs text-slate-500 font-medium">Core Workspace</div>
          <div className="text-sm font-bold text-slate-800 tracking-tight">
            {viewTitles[activeView] || 'Overview'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Attendance Clock Pill */}
        <button
          onClick={() => openModal('clock')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
            punchState.clockedIn
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
          title="Click to punch attendance or view daily clock record"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              punchState.clockedIn ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
            }`}
          />
          <span>
            {punchState.clockedIn ? `Clocked In: ${punchState.clockInTime}` : 'Clocked Out'}
          </span>
        </button>

        {/* Month Selector */}
        <select
          className="hidden md:block bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 text-slate-700 outline-none cursor-pointer focus:border-emerald-600"
          defaultValue="September 2026"
        >
          <option>September 2026</option>
          <option>August 2026</option>
          <option>July 2026</option>
        </select>

        {/* Dynamic Spatie Role Selector */}
        <div className="relative">
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value as Role)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-2.5 py-1.5 text-slate-800 outline-none cursor-pointer focus:border-emerald-600 shadow-2xs"
            title="Switch Simulated Spatie Role"
          >
            <option value="Super Admin">Super Admin (All Access)</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR Manager</option>
            <option value="Manager">Manager (Team Lead)</option>
            <option value="Member">Team Member (Field Rep)</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => openModal('notifications')}
          className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
          title={`${unreadNotifsCount} Pending Notifications`}
        >
          <Bell size={17} />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => openModal('profile')}
          className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center justify-center hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1 cursor-pointer transition-all shadow-2xs"
          title={`Logged in as ${currentUser.name} - View Profile`}
        >
          {currentUser.avatar || 'AP'}
        </button>
      </div>
    </header>
  );
};
