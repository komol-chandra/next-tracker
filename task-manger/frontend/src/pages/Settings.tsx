import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Settings = () => {
  const { user, can } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resp = await apiClient.get("/settings");
        setSettings(resp.data.data);
      } catch (err: any) {
        setMessage({ kind: "err", text: err.response?.data?.message || "Failed to load settings." });
      }
      setLoading(false);
    };
    loadSettings();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  if (!can("settings.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to edit settings</p>;
  }

  const editable = (patch: any) => {
    setSettings((s: any) => ({ ...s, ...patch }));
    setDirty(true);
    setMessage(null);
  };

  const num = (v: string) => (v === "" ? "" : Number(v));

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const resp = await apiClient.put("/settings", {
        idleThresholdSeconds: Number(settings.idleThresholdSeconds),
        defaultWorkingHours: Number(settings.defaultWorkingHours),
        officeStartTime: settings.officeStartTime,
        lateGraceMinutes: Number(settings.lateGraceMinutes),
        monthlySubmissionDay: Number(settings.monthlySubmissionDay),
        approvalWindowDay: Number(settings.approvalWindowDay),
        overtimeRateMultiplier: Number(settings.overtimeRateMultiplier),
        workingDays: settings.workingDays,
        leaveAllowance: {
          casual: Number(settings.leaveAllowance?.casual),
          sick: Number(settings.leaveAllowance?.sick),
          annual: Number(settings.leaveAllowance?.annual),
        },
        sickCertificateAfterDays: Number(settings.sickCertificateAfterDays),
        deductionFormula: settings.deductionFormula,
      });
      setSettings(resp.data.data);
      setDirty(false);
      setMessage({ kind: "ok", text: "Settings saved." });
    } catch (err: any) {
      setMessage({ kind: "err", text: err.response?.data?.message || "Save failed." });
    }
    setSaving(false);
  };

  const input = "w-full px-3 py-2 border rounded";
  const label = "text-sm text-gray-500 mb-1 block";

  return (
    <div className="p-2 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        {dirty && <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>}
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      {settings && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="font-medium mb-4">Timer & Working Hours</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={label}>Web Timer Idle Detection Threshold</label>
                <select
                  className={input}
                  value={String(settings.idleThresholdSeconds || 60)}
                  onChange={(e) => editable({ idleThresholdSeconds: Number(e.target.value) })}
                >
                  <option value="60">1 minute (demo/testing)</option>
                  <option value="300">5 minutes (standard)</option>
                  <option value="600">10 minutes (extended)</option>
                </select>
              </div>
              <div>
                <label className={label}>Default Working Hours / Day (4–12)</label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  className={input}
                  value={settings.defaultWorkingHours ?? 8}
                  onChange={(e) => editable({ defaultWorkingHours: num(e.target.value) })}
                />
              </div>
              <div>
                <label className={label}>Office Start Time</label>
                <input
                  type="time"
                  className={input}
                  value={settings.officeStartTime || "09:00"}
                  onChange={(e) => editable({ officeStartTime: e.target.value })}
                />
              </div>
              <div>
                <label className={label}>Late Grace Period (minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className={input}
                  value={settings.lateGraceMinutes ?? 15}
                  onChange={(e) => editable({ lateGraceMinutes: num(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className={label}>Working Days</label>
                <div className="flex gap-2">
                  {DAY_NAMES.map((name, idx) => {
                    const on = (settings.workingDays || []).includes(idx);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          editable({
                            workingDays: on
                              ? settings.workingDays.filter((d: number) => d !== idx)
                              : [...(settings.workingDays || []), idx].sort(),
                          })
                        }
                        className={`px-3 py-1 rounded text-sm border ${
                          on ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {name.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="font-medium mb-4">Monthly Cycle Deadlines</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={label}>Plan Submission Deadline (day of month, 1–31)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className={input}
                  value={settings.monthlySubmissionDay ?? 25}
                  onChange={(e) => editable({ monthlySubmissionDay: num(e.target.value) })}
                />
              </div>
              <div>
                <label className={label}>Approval Window Closes (day of month, 1–31)</label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  className={input}
                  value={settings.approvalWindowDay ?? 28}
                  onChange={(e) => editable({ approvalWindowDay: num(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="font-medium mb-4">Leave Policy</h2>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className={label}>Casual (days/yr)</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={settings.leaveAllowance?.casual ?? 10}
                  onChange={(e) =>
                    editable({ leaveAllowance: { ...settings.leaveAllowance, casual: num(e.target.value) } })
                  }
                />
              </div>
              <div>
                <label className={label}>Sick (days/yr)</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={settings.leaveAllowance?.sick ?? 7}
                  onChange={(e) =>
                    editable({ leaveAllowance: { ...settings.leaveAllowance, sick: num(e.target.value) } })
                  }
                />
              </div>
              <div>
                <label className={label}>Annual (days/yr)</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={settings.leaveAllowance?.annual ?? 15}
                  onChange={(e) =>
                    editable({ leaveAllowance: { ...settings.leaveAllowance, annual: num(e.target.value) } })
                  }
                />
              </div>
              <div>
                <label className={label}>Sick Certificate After (days)</label>
                <input
                  type="number"
                  min={0}
                  className={input}
                  value={settings.sickCertificateAfterDays ?? 1}
                  onChange={(e) => editable({ sickCertificateAfterDays: num(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow-sm">
            <h2 className="font-medium mb-4">Payroll</h2>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className={label}>Overtime Rate Multiplier (×)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className={input}
                  value={settings.overtimeRateMultiplier ?? 1.5}
                  onChange={(e) => editable({ overtimeRateMultiplier: num(e.target.value) })}
                />
              </div>
            </div>
            <label className={label}>Absence Payroll Deduction Formula (read-only standard)</label>
            <textarea
              readOnly
              rows={2}
              className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 font-mono text-sm cursor-not-allowed"
              value={settings.deductionFormula || ""}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
