import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DashboardStats, Task, User } from '../types';
import {
  Clock,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
  Users,
  Play,
  Pause,
  ArrowUpRight,
  ShieldAlert,
  BarChart2,
  DollarSign
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    openModal,
    setActiveView,
    timer,
    toggleTimer,
    selectTaskForTimer,
    formatSeconds,
    dataVersion,
    currentTenant
  } = useApp();

  const [tab, setTab] = useState<'my' | 'team' | 'quick-timer'>('my');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getDashboardStats(), api.getTasks(), api.getCurrentUser()])
      .then(([statsRes, tasksRes]) => {
        setStats(statsRes);
        setTasks(tasksRes.tasks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataVersion, currentTenant.id]);

  const activeFocusTasks = tasks.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Workforce Overview & Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Workforce Operations & Monitoring &middot; September 2026 Cycle &middot; Tenant: {currentTenant.name}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('clock')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Clock size={14} className="text-emerald-700" />
            <span>Punch Attendance</span>
          </button>
          <button
            onClick={() => openModal('newTask')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <span>+ New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl max-w-fit border border-slate-200">
        <button
          onClick={() => setTab('my')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'my'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Dashboard
        </button>
        <button
          onClick={() => setTab('team')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'team'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Team & Org Overview
        </button>
        <button
          onClick={() => setTab('quick-timer')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            tab === 'quick-timer'
              ? 'bg-white text-emerald-950 shadow-2xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quick Time Logger
        </button>
      </div>

      {/* Tab 1: My Dashboard */}
      {tab === 'my' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Hours Logged (Week)</span>
                <Clock size={16} className="text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">34.5h</div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1.5">
                <ArrowUpRight size={13} />
                <span>Target: 40h &middot; 86% fulfilled</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Attendance this Month</span>
                <CheckCircle2 size={16} className="text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-emerald-800 tracking-tight">95.2%</div>
              <div className="text-[11px] text-slate-500 mt-1.5">20 days present, 1 approved leave</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Monthly Plan Progress</span>
                <TrendingUp size={16} className="text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">78%</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1.5">&uarr; 12% vs last cycle quota</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Net Salary (Est.)</span>
                <DollarSign size={16} className="text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-[#134937] tracking-tight">৳ 85,400</div>
              <div className="text-[11px] text-slate-500 mt-1.5">Base + Bonus - Absences</div>
            </div>
          </div>

          {/* Section: Active Tasks & Progress Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Focus & Active Tasks */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Today&apos;s Focus & Active Tasks
                  </h3>
                  <p className="text-xs text-slate-500">Tracked today: 5h 42m &middot; Priority Route 01</p>
                </div>
                <button
                  onClick={() => setActiveView('tasks')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  View All Tasks &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {activeFocusTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{t.title}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            t.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : t.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{t.desc}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Category: <span className="font-semibold text-slate-600">{t.category}</span> &middot; Due:{' '}
                        <span className="font-semibold text-slate-600">{t.due}</span> &middot; Logged:{' '}
                        <span className="font-semibold text-emerald-700">{t.hoursLogged}h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-black text-slate-700">{t.progress}%</div>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          selectTaskForTimer(t.id, t.title);
                          setActiveView('timer');
                        }}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-emerald-800 hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer"
                        title="Start timer for this task"
                      >
                        <Clock size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan vs Achievement (Roll-Up) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Plan vs Achievement</h3>
                  <button
                    onClick={() => setActiveView('reports')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Full Report
                  </button>
                </div>

                {/* Donut representation */}
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32 rounded-full border-8 border-emerald-700 border-t-amber-400 border-l-rose-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-slate-900">82%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        Completion
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700"></span> Achieved
                    </span>
                    <span className="font-bold text-slate-900">68%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> In Progress
                    </span>
                    <span className="font-bold text-slate-900">20%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Pending / Delayed
                    </span>
                    <span className="font-bold text-slate-900">12%</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Retail Outlet Visits</span>
                    <span className="text-emerald-700">85%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Receivable Collections</span>
                    <span className="text-emerald-700">72%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Org Overview */}
      {tab === 'team' && (
        <div className="space-y-6">
          {/* Team KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Total Workforce</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">16 Reps</div>
              <div className="text-xs text-slate-500 mt-1">4 Cross-functional Departments</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Currently Clocked In</div>
              <div className="text-2xl font-black text-emerald-800 tracking-tight">14 / 16</div>
              <div className="text-xs text-emerald-700 font-semibold mt-1">2 on approved paid leave</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Active Web Timers</div>
              <div className="text-2xl font-black text-sky-800 tracking-tight">11 Running</div>
              <div className="text-xs text-slate-500 mt-1">Web idle detection active</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pending Approvals</div>
              <div className="text-2xl font-black text-amber-700 tracking-tight">5 Items</div>
              <div className="text-xs text-amber-800 font-semibold mt-1">3 Plans + 2 Timesheets</div>
            </div>
          </div>

          {/* Live Member Tracker Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Live Member Tracker & Daily Activity
                </h3>
                <p className="text-xs text-slate-500">Real-time attendance & current task tracking</p>
              </div>
              <button
                onClick={() => setActiveView('approvals')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-emerald-800 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Review Pending Items
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Attendance</th>
                    <th className="py-3 px-4">Current Task / Timer</th>
                    <th className="py-3 px-4">Hours Today</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Adhara Paul</div>
                      <div className="text-[11px] text-slate-400">Operations Lead & Member 1</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">Operations Leadership</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Present (08:50 AM)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">Workforce OS Architecture & Time Audit</div>
                      <div className="text-[11px] text-emerald-700 font-mono">Timer running: 4h 15m</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">6.8 hrs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openModal('memberDetail', { empId: 'usr-1', name: 'Adhara Paul' })}
                        className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Mahmud Sahiuddin</div>
                      <div className="text-[11px] text-slate-400">Area Sales Manager</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">Dhaka North Sales</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Present (09:12 AM)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">Priority Outlet Visit - Route 01</div>
                      <div className="text-[11px] text-emerald-700 font-mono">Timer running: 3h 12m</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">5.7 hrs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openModal('memberDetail', { empId: 'usr-2', name: 'Mahmud Sahiuddin' })}
                        className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Ravi Kumar</div>
                      <div className="text-[11px] text-slate-400">Sales Officer (SO)</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">Dhaka North Sales</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Clocked 10:15 AM (Late)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">Dealer Merchandising Audit</div>
                      <div className="text-[11px] text-emerald-700 font-mono">Timer running: 4h 39m</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">4.5 hrs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openModal('memberDetail', { empId: 'usr-3', name: 'Ravi Kumar' })}
                        className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">Tanvir Ahmed</div>
                      <div className="text-[11px] text-slate-400">Technical Lead</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">Alpha Devs</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Present (08:55 AM)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">ERP Sanctum & Spatie Integration</div>
                      <div className="text-[11px] text-emerald-700 font-mono">Timer running: 6h 00m</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">6.0 hrs</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openModal('memberDetail', { empId: 'usr-5', name: 'Tanvir Ahmed' })}
                        className="text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Quick Time Logger */}
      {tab === 'quick-timer' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs max-w-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-black text-slate-900">Direct Web Timer Control</h3>
              <p className="text-xs text-slate-500">
                Browser activity tracking with auto-idle detection (inactivity threshold: 60s)
              </p>
            </div>
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Active Protection
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Task to Log Hours Against
              </label>
              <select
                value={timer.activeTaskId}
                onChange={(e) => {
                  const t = tasks.find((x) => x.id === e.target.value);
                  if (t) selectTaskForTimer(t.id, t.title);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} &middot; ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
                Elapsed Active Work Duration
              </div>
              <div className="text-5xl font-black text-emerald-800 font-mono tracking-tight my-2">
                {formatSeconds(timer.seconds)}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                Active task: <b className="text-slate-800">{timer.activeTaskTitle}</b>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                  timer.running
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {timer.running ? (
                  <>
                    <Pause size={17} />
                    <span>Pause Timer Session</span>
                  </>
                ) : (
                  <>
                    <Play size={17} fill="currentColor" />
                    <span>Start Live Web Timer</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveView('timer')}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
              >
                Full Timesheet &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
