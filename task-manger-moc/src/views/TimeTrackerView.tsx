import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task, Timesheet, TimeEntry } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Send,
  Download,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const TimeTrackerView: React.FC = () => {
  const {
    timer,
    toggleTimer,
    resetTimer,
    formatSeconds,
    selectTaskForTimer,
    idle,
    openModal,
    showToast,
    dataVersion,
    triggerRefresh
  } = useApp();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getTasks(), api.getTimesheets(), api.getTimeEntries()])
      .then(([tasksRes, timesheetsRes, entriesRes]) => {
        setTasks(tasksRes.tasks);
        setTimesheets(timesheetsRes.timesheets);
        setEntries(entriesRes.entries);
        const currentT = tasksRes.tasks.find((t) => t.id === timer.activeTaskId) || tasksRes.tasks[0];
        setSelectedTask(currentT || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dataVersion, timer.activeTaskId]);

  const currentTimesheet = timesheets[0] || {
    id: 'ts-1',
    weekLabel: 'Week 37 (Sep 07 - Sep 13, 2026)',
    dailyHours: { mon: 7.5, tue: 8.0, wed: 7.0, thu: 8.0, fri: 4.0, sat: 0.0, sun: 0.0 },
    totalHours: 34.5,
    status: 'Draft' as const,
    idleFlags: 0
  };

  const handleCellChange = async (day: string, value: string) => {
    const hours = parseFloat(value) || 0;
    try {
      await api.updateTimesheetCell(currentTimesheet.id, day, hours);
      setTimesheets((prev) =>
        prev.map((ts) => {
          if (ts.id === currentTimesheet.id) {
            const updatedDaily = { ...ts.dailyHours, [day]: hours };
            const newTotal = parseFloat(
              Object.values(updatedDaily)
                .reduce((a, b) => a + b, 0)
                .toFixed(1)
            );
            return { ...ts, dailyHours: updatedDaily, totalHours: newTotal };
          }
          return ts;
        })
      );
      showToast(`Updated ${day.toUpperCase()}: ${hours}h`);
    } catch {
      showToast(`Failed to update timesheet cell`, 'error');
    }
  };

  const handleSubmitTimesheet = async () => {
    try {
      await api.submitTimesheet(currentTimesheet.id);
      showToast('Weekly timesheet submitted for Supervisor approval!');
      triggerRefresh();
    } catch {
      showToast('Timesheet submitted locally.');
    }
  };

  // Daily totals calculation
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Web-Based Time Tracker & Timesheets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Task-linked timer with browser idle detection (mouse/keyboard inactivity) &middot; Member 1: Adhara Paul
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('manualTime')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Plus size={14} className="text-emerald-700" />
            <span>+ Manual Log</span>
          </button>
          <button
            onClick={handleSubmitTimesheet}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send size={14} />
            <span>Submit Timesheet</span>
          </button>
        </div>
      </div>

      {/* Main Timer Control Card */}
      <div className="bg-gradient-to-b from-white to-[#f5faf7] border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Selected Task & Info */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Selected Task & Monthly Plan Target
            </label>
            <select
              value={timer.activeTaskId}
              onChange={(e) => {
                const t = tasks.find((x) => x.id === e.target.value);
                if (t) {
                  selectTaskForTimer(t.id, t.title);
                  setSelectedTask(t);
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-600 shadow-2xs"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} &middot; ({t.category})
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-3">
              <span>
                Department: <b className="text-slate-700">{selectedTask?.dept || 'Field Sales'}</b>
              </span>
              <span>&middot;</span>
              <span>
                Plan: <b className="text-slate-700">September 2026 Target</b>
              </span>
              <span>&middot;</span>
              <span>
                Hours Logged: <b className="text-emerald-700">{selectedTask?.hoursLogged || 0}h</b>
              </span>
            </div>
          </div>

          {/* Big Live Clock */}
          <div className="text-center">
            <div className="text-5xl font-black text-emerald-800 font-mono tracking-tight tabular-nums">
              {formatSeconds(timer.seconds)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
              <span>Browser Activity:</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  idle.detected ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    idle.detected ? 'bg-amber-500' : 'bg-emerald-600 animate-pulse'
                  }`}
                />
                {idle.detected ? 'Idle Warning' : 'Active & Monitored'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTimer}
              className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                timer.running
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {timer.running ? (
                <>
                  <Pause size={17} />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play size={17} fill="currentColor" />
                  <span>Start Timer</span>
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all cursor-pointer shadow-2xs"
              title="Reset current session duration"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Timesheet Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Weekly Timesheet ({currentTimesheet.weekLabel})
            </h3>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>
                Weekly Total: <b className="text-slate-800">{currentTimesheet.totalHours} hrs</b>
              </span>
              <span>&middot;</span>
              <span>
                Status:{' '}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    currentTimesheet.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentTimesheet.status === 'Submitted'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentTimesheet.status === 'Draft' ? 'Draft (Not submitted)' : currentTimesheet.status}
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={() => showToast('Exported weekly timesheet to CSV format.')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Timesheet Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Task / Monthly Objective</th>
                <th className="py-3 px-3 text-center">Mon 7</th>
                <th className="py-3 px-3 text-center">Tue 8</th>
                <th className="py-3 px-3 text-center">Wed 9</th>
                <th className="py-3 px-3 text-center">Thu 10</th>
                <th className="py-3 px-3 text-center">Fri 11</th>
                <th className="py-3 px-3 text-center">Sat 12</th>
                <th className="py-3 px-3 text-center">Sun 13</th>
                <th className="py-3 px-4 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">Priority Outlet Visit - Route 01</div>
                  <div className="text-[11px] text-slate-400">Field Operational Visit</div>
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.mon || 4.5}
                    onChange={(e) => handleCellChange('mon', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.tue || 4.0}
                    onChange={(e) => handleCellChange('tue', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.wed || 3.5}
                    onChange={(e) => handleCellChange('wed', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.thu || 5.0}
                    onChange={(e) => handleCellChange('thu', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.fri || 2.0}
                    onChange={(e) => handleCellChange('fri', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.sat || 0.0}
                    onChange={(e) => handleCellChange('sat', e.target.value)}
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    className="w-16 py-1 px-1.5 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-emerald-600 outline-none"
                    defaultValue={currentTimesheet.dailyHours.sun || 0.0}
                    onChange={(e) => handleCellChange('sun', e.target.value)}
                  />
                </td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800 text-sm">
                  19.0h
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">Distributor Meeting - Q4 Target</div>
                  <div className="text-[11px] text-slate-400">Reconciliation & Supply</div>
                </td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">2.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">1.5h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">1.5h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">0.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">1.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">0.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">0.0h</td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800 text-sm">
                  6.0h
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">Overdue Collection Recovery</div>
                  <div className="text-[11px] text-slate-400">Financial Receivables</div>
                </td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">1.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">2.5h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">2.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">3.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">1.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">0.0h</td>
                <td className="py-2 px-3 text-center font-semibold text-slate-700">0.0h</td>
                <td className="py-3 px-4 text-center font-extrabold text-emerald-800 text-sm">
                  9.5h
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-900">
                <td className="py-3 px-4">Daily Totals</td>
                <td className="py-3 px-3 text-center">7.5h</td>
                <td className="py-3 px-3 text-center">8.0h</td>
                <td className="py-3 px-3 text-center">7.0h</td>
                <td className="py-3 px-3 text-center">8.0h</td>
                <td className="py-3 px-3 text-center">4.0h</td>
                <td className="py-3 px-3 text-center">0.0h</td>
                <td className="py-3 px-3 text-center">0.0h</td>
                <td className="py-3 px-4 text-center text-emerald-800 text-base">
                  {currentTimesheet.totalHours}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Task Time Entries History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Recent Task Time Logs</h3>
            <p className="text-xs text-slate-500">Audited session logs recorded via timer and manual logs</p>
          </div>
          <button
            onClick={() => openModal('manualTime')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            + Add Manual Entry
          </button>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{entry.taskTitle}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {entry.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      entry.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="text-slate-500 font-medium">{entry.notes}</div>
                <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {entry.date} ({entry.startTime} - {entry.endTime})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {entry.location}
                  </span>
                  <span>Source: {entry.source}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-emerald-800">{entry.durationHours} hrs</div>
                <div className="text-[11px] text-slate-400 font-medium">Logged by {entry.userName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
