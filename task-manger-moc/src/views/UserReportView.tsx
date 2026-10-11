import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task } from '../types';
import {
  FileSpreadsheet,
  Download,
  Paperclip,
  CheckCircle2
} from 'lucide-react';

export const UserReportView: React.FC = () => {
  const { openModal, showToast, dataVersion } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getTasks()
      .then((res) => {
        setTasks(res.tasks);
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
            User-Wise Task & Activity Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Detailed task report grouped by user with timestamps, remarks, proof attachments, and status
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('User report exported to Excel sheet.')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => showToast('User report PDF compiled and downloaded.')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4 min-w-[200px]">Task Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-4 min-w-[160px]">Remarks</th>
                <th className="py-3 px-4 text-right">Attachments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900">{t.ownerName}</div>
                    <div className="text-[11px] text-slate-400">{t.dept}</div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openModal('taskDetail', { task: t })}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left cursor-pointer"
                    >
                      {t.title}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{t.category}</td>
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
                  <td className="py-3 px-3 text-slate-500">2026-09-01</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{t.due}</td>
                  <td className="py-3 px-4 text-slate-500 leading-relaxed truncate max-w-xs">
                    {t.desc}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() =>
                        openModal('attachmentPreview', { user: t.ownerName, taskTitle: t.title })
                      }
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 inline-flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Paperclip size={12} />
                      <span>2 Proofs</span>
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
