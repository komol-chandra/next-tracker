import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { TaskPreset } from '../types';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const TaskPresetsView: React.FC = () => {
  const { openModal, dataVersion } = useApp();
  const [presets, setPresets] = useState<TaskPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getTaskPresets()
      .then((res) => {
        setPresets(res.presets);
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
            Admin Task Types & Master Presets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admin manages reusable task templates; members select and propose plan specifics
          </p>
        </div>
        <button
          onClick={() => openModal('newTaskPreset')}
          className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>New Preset</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3 px-4">Preset Task Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Frequency</th>
                <th className="py-3 px-3">Default Target</th>
                <th className="py-3 px-3">Allowed Roles</th>
                <th className="py-3 px-4">Proof Verification</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {presets.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{p.category}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{p.freq}</td>
                  <td className="py-3 px-3 font-bold text-emerald-800">{p.target}</td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{p.role}</td>
                  <td className="py-3 px-4 text-slate-600">{p.proofType}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
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
