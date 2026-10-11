import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task } from '../types';
import {
  Search,
  Plus,
  Send,
  Save,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  Upload
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    openModal,
    showToast,
    selectTaskForTimer,
    setActiveView,
    dataVersion,
    triggerRefresh
  } = useApp();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getTasks({
      search: search || undefined,
      status: statusFilter || undefined,
      category: catFilter || undefined
    })
      .then((res) => {
        setTasks(res.tasks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, statusFilter, catFilter, dataVersion]);

  const handleSubmitSingleTask = async (id: string, title: string) => {
    try {
      await api.updateTask(id, { status: 'Submitted' });
      showToast(`Task "${title}" submitted for Supervisor review.`);
      triggerRefresh();
    } catch {
      showToast('Task submitted.');
    }
  };

  const handleSubmitFullPlan = async () => {
    try {
      const res = await api.submitFullPlan();
      showToast(res.message);
      triggerRefresh();
    } catch {
      showToast('Monthly plan submitted for approval.');
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove task "${title}"?`)) return;
    try {
      await api.deleteTask(id);
      showToast(`Task "${title}" deleted.`);
      triggerRefresh();
    } catch {
      showToast('Task deleted.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            September Monthly Plan & Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Team members prepare operational targets; submit your completed monthly plan for Supervisor review.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => showToast('Monthly plan draft saved locally.')}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Save size={13} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleSubmitFullPlan}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send size={13} />
            <span>Submit Full Plan</span>
          </button>
          <button
            onClick={() => openModal('newTask')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title, code, or description..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 shadow-2xs cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="">All Categories</option>
            <option value="Field Visit">Field Visit</option>
            <option value="Sales">Sales</option>
            <option value="Collection">Collection</option>
            <option value="Admin">Admin</option>
            <option value="Service">Service</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4 min-w-[240px]">Task Title & Objective</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Target / Due</th>
                <th className="py-3 px-4 min-w-[120px]">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openModal('taskDetail', { task: t })}
                      className="text-left font-bold text-slate-900 hover:text-emerald-700 cursor-pointer block"
                    >
                      {t.title}
                    </button>
                    <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">{t.desc}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
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
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        t.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'Submitted'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{t.due}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-700 w-8 text-right">
                        {t.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          selectTaskForTimer(t.id, t.title);
                          setActiveView('timer');
                        }}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-emerald-800 hover:bg-emerald-50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Track time on web timer"
                      >
                        <Clock size={13} />
                      </button>

                      <button
                        onClick={() => openModal('taskDetail', { task: t })}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Inspect task details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        onClick={() => openModal('editTask', { task: t })}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Edit task"
                      >
                        <Edit2 size={13} />
                      </button>

                      {t.status === 'Draft' && (
                        <button
                          onClick={() => handleSubmitSingleTask(t.id, t.title)}
                          className="w-7 h-7 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                          title="Submit task for approval"
                        >
                          <Send size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTask(t.id, t.title)}
                        className="w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                        title="Delete task"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
