import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewTab } from '../../types';
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  CheckSquare,
  Target,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  BarChart3,
  FileSpreadsheet,
  Network,
  SlidersHorizontal,
  Settings,
  Play,
  Pause
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentTenant,
    tenants,
    switchTenant,
    currentRole,
    activeView,
    setActiveView,
    sidebarCollapsed,
    timer,
    toggleTimer,
    formatSeconds
  } = useApp();

  const isAdmin = currentRole === 'Super Admin' || currentRole === 'Admin';
  const isManager = isAdmin || currentRole === 'Manager';
  const isHR = isAdmin || currentRole === 'HR';

  const navItems: Array<{
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    show: boolean;
    tag?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <LayoutDashboard size={17} />,
      show: true,
      tag: 'Member 1'
    },
    {
      id: 'timer',
      label: 'Time Tracker',
      icon: <Clock size={17} />,
      badge: timer.running ? formatSeconds(timer.seconds).slice(0, 5) : '00:00',
      badgeColor: timer.running ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-emerald-300',
      show: true,
      tag: 'Member 1'
    },
    {
      id: 'leaves',
      label: 'Leave & Holidays',
      icon: <CalendarCheck size={17} />,
      badge: '3',
      badgeColor: 'bg-amber-600 text-white',
      show: true,
      tag: 'Member 1'
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: <CheckSquare size={17} />,
      badge: '12',
      badgeColor: 'bg-emerald-700 text-white',
      show: true
    },
    {
      id: 'monthly-plan',
      label: 'Monthly Planning',
      icon: <Target size={17} />,
      show: true
    },
    {
      id: 'attendance',
      label: 'HR & Attendance',
      icon: <CalendarDays size={17} />,
      show: true
    },
    {
      id: 'approvals',
      label: 'Approvals & Reviews',
      icon: <ShieldCheck size={17} />,
      badge: '3',
      badgeColor: 'bg-amber-600 text-white',
      show: isManager || isHR
    },
    {
      id: 'payroll',
      label: 'Payroll & Payslips',
      icon: <CreditCard size={17} />,
      show: isHR || isManager
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: <BarChart3 size={17} />,
      show: true
    },
    {
      id: 'user-report',
      label: 'User-wise Log',
      icon: <FileSpreadsheet size={17} />,
      show: true
    }
  ];

  const adminNavItems: Array<{
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    show: boolean;
    tag?: string;
  }> = [
    {
      id: 'org-rbac',
      label: 'Org & Spatie RBAC',
      icon: <Network size={17} />,
      show: isAdmin || isManager,
      tag: 'Member 1'
    },
    {
      id: 'task-types',
      label: 'Task Presets',
      icon: <SlidersHorizontal size={17} />,
      show: isAdmin || isManager
    },
    {
      id: 'settings',
      label: 'Configuration',
      icon: <Settings size={17} />,
      show: true
    }
  ];

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col justify-between bg-[#102c22] text-[#dbe9e3] border-r border-[#1d4638] transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? '-translate-x-full lg:w-0 lg:p-0 lg:opacity-0 pointer-events-none' : 'translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto px-3.5 py-4 scrollbar-thin">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pb-4 mb-2 border-b border-[#1c4738]">
          <div className="w-9 h-9 rounded-xl bg-[#9bd5bd] text-[#123326] font-black text-lg flex items-center justify-center shadow-sm">
            S
          </div>
          <div>
            <div className="font-bold text-white text-[15px] leading-tight tracking-tight">ERP Operations</div>
            <div className="text-[11px] text-[#93baaa]">Agency & Workforce OS</div>
          </div>
        </div>

        {/* Tenant Switcher */}
        <div className="bg-[#163b2e] border border-[#235442] rounded-xl p-2.5 mb-3.5 shadow-xs">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9ec4b3] mb-1">
            Tenant / Company
          </label>
          <select
            value={currentTenant.id}
            onChange={(e) => switchTenant(e.target.value)}
            className="w-full bg-[#102c22] text-white font-semibold text-xs py-1.5 px-2 rounded-lg border border-[#2e624f] outline-none cursor-pointer focus:border-[#9bd5bd]"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#102c22] text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Section 1: Core Operations */}
        <div className="text-[10px] font-black uppercase tracking-widest text-[#7ba594] px-2 py-1 mb-1">
          Core Operations
        </div>
        <nav className="space-y-0.5 mb-4">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium text-[13px] transition-all duration-150 ${
                    isActive
                      ? 'bg-[#21493a] text-white font-semibold shadow-xs'
                      : 'text-[#bdcec7] hover:bg-[#183d30] hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#9bd5bd]' : 'text-[#87ab9c]'}`}>{item.icon}</span>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Navigation Section 2: Administration */}
        <div className="text-[10px] font-black uppercase tracking-widest text-[#7ba594] px-2 py-1 mb-1">
          Administration
        </div>
        <nav className="space-y-0.5 mb-4">
          {adminNavItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium text-[13px] transition-all duration-150 ${
                    isActive
                      ? 'bg-[#21493a] text-white font-semibold shadow-xs'
                      : 'text-[#bdcec7] hover:bg-[#183d30] hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#9bd5bd]' : 'text-[#87ab9c]'}`}>{item.icon}</span>
                  <span className="truncate flex-1">{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Live Mini-Timer Widget */}
        <div className="mt-auto mb-3 bg-[#163b2e] border border-[#285443] rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#9bc5b3] tracking-wide mb-1">
            <span>ACTIVE TASK</span>
            {timer.running && (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px]">LIVE</span>
              </span>
            )}
          </div>
          <div className="text-xl font-extrabold text-white font-mono tracking-tight my-0.5">
            {formatSeconds(timer.seconds)}
          </div>
          <div className="text-[11px] text-[#d5e8df] truncate mb-2.5 font-medium" title={timer.activeTaskTitle}>
            {timer.activeTaskTitle}
          </div>
          <button
            onClick={toggleTimer}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              timer.running
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {timer.running ? (
              <>
                <Pause size={13} />
                <span>Pause Timer</span>
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                <span>Start Timer</span>
              </>
            )}
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-[#17392d] border border-[#2c4c40] rounded-xl p-2.5 text-xs text-[#a3c9b8]">
          <div className="font-bold text-white text-[11px]">Monthly Cycle: Sep 2026</div>
          <div className="text-[10px] text-[#86af9d] mt-0.5">Planning cycle open till 25th</div>
        </div>
      </div>
    </aside>
  );
};
