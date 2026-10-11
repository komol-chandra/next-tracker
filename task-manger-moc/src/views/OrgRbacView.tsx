import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { OrgDepartment, SpatiePermission } from '../types';
import {
  Network,
  Plus,
  Shield,
  Building2,
  Users,
  User,
  Check,
  Minus,
  Lock,
  ChevronRight
} from 'lucide-react';

export const OrgRbacView: React.FC = () => {
  const { openModal, currentTenant, dataVersion } = useApp();
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [permissions, setPermissions] = useState<SpatiePermission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getDepartments(), api.getRbacMatrix()])
      .then(([deptRes, rbacRes]) => {
        setDepartments(deptRes.departments);
        setPermissions(rbacRes.permissions);
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
            Organization Structure & Spatie RBAC
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Company (tenant) &rarr; Department &rarr; Team &rarr; Member with scoped Spatie roles & permissions &middot; Member 1: Adhara Paul
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('addDept')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Plus size={14} className="text-emerald-700" />
            <span>+ Add Department</span>
          </button>
          <button
            onClick={() => openModal('newRole')}
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Shield size={14} />
            <span>+ New Spatie Role</span>
          </button>
        </div>
      </div>

      {/* Grid: Org Tree on Left, Spatie Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Org Hierarchy Tree */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Company Hierarchy Tree
                </h3>
                <p className="text-xs text-slate-500">Multi-tenant partitioned structure</p>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Multi-Tenant: Active
              </span>
            </div>

            {/* Tree Container */}
            <div className="space-y-3 text-xs">
              {/* Tenant Root Node */}
              <div
                onClick={() =>
                  openModal('nodeDetail', { title: currentTenant.name, type: 'Tenant Root' })
                }
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 font-bold text-emerald-950 cursor-pointer hover:bg-emerald-100 transition-all shadow-2xs"
              >
                <Building2 size={16} className="text-emerald-700" />
                <span>{currentTenant.name} (Tenant Root)</span>
              </div>

              {/* Departments */}
              <div className="ml-4 pl-3 border-l-2 border-emerald-200 space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div
                      onClick={() =>
                        openModal('nodeDetail', { title: dept.name, type: 'Department' })
                      }
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-slate-900 font-bold hover:bg-slate-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                        <span className="truncate">{dept.name} ({dept.code})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                        {dept.budget}
                      </span>
                    </div>

                    {/* Teams under Department */}
                    <div className="ml-4 pl-3 border-l border-slate-200 space-y-2">
                      {dept.teams.map((team) => (
                        <div key={team.name} className="space-y-1.5">
                          <div
                            onClick={() =>
                              openModal('nodeDetail', { title: team.name, type: 'Team' })
                            }
                            className="p-2 bg-white border border-slate-200 rounded-md flex items-center gap-2 text-slate-800 font-semibold hover:border-emerald-300 cursor-pointer transition-all text-[11px]"
                          >
                            <Users size={13} className="text-slate-500" />
                            <span className="truncate">{team.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              (Lead: {team.lead})
                            </span>
                          </div>

                          {/* Members */}
                          <div className="ml-4 pl-2 space-y-1">
                            {team.members.map((member) => (
                              <div
                                key={member}
                                onClick={() =>
                                  openModal('nodeDetail', { title: member, type: 'Member' })
                                }
                                className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-emerald-800 cursor-pointer py-0.5"
                              >
                                <User size={11} className="text-slate-400" />
                                <span className="truncate">{member}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
            Click any node in the hierarchy to inspect access boundaries, tenant ID binding, and assigned Spatie RBAC policies.
          </div>
        </div>

        {/* Spatie Permission Matrix Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Spatie Roles & Permission Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Team-scoped authorization enforcing zero cross-department data leaks
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Spatie Schema
            </span>
          </div>

          <div className="overflow-x-auto max-h-[560px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-2.5 px-3">Permission Key & Name</th>
                  <th className="py-2.5 px-2 text-center">Admin</th>
                  <th className="py-2.5 px-2 text-center">HR</th>
                  <th className="py-2.5 px-2 text-center">Manager</th>
                  <th className="py-2.5 px-2 text-center">Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((p) => (
                  <tr key={p.perm} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="font-mono text-[10px] text-emerald-800">{p.perm}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {p.admin ? (
                        <Check size={14} className="mx-auto text-emerald-700 stroke-[3]" />
                      ) : (
                        <Minus size={14} className="mx-auto text-slate-300" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {p.hr ? (
                        <Check size={14} className="mx-auto text-emerald-700 stroke-[3]" />
                      ) : (
                        <Minus size={14} className="mx-auto text-slate-300" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {p.manager ? (
                        <Check size={14} className="mx-auto text-emerald-700 stroke-[3]" />
                      ) : (
                        <Minus size={14} className="mx-auto text-slate-300" />
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {p.member ? (
                        <Check size={14} className="mx-auto text-emerald-700 stroke-[3]" />
                      ) : (
                        <Minus size={14} className="mx-auto text-slate-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
