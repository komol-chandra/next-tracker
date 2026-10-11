import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const TIMEZONES = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Karachi",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

const Configuration = () => {
  const { user, can } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingTenant, setSavingTenant] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [tenantDirty, setTenantDirty] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [setResp, tenResp] = await Promise.all([
          apiClient.get("/settings"),
          apiClient.get("/tenant"),
        ]);
        setSettings(setResp.data.data);
        setTenant(tenResp.data.data);
      } catch (err: any) {
        setMessage({ kind: "err", text: err.response?.data?.message || "Failed to load configuration" });
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  if (!can("settings.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to view configuration</p>;
  }

  const editTenant = (patch: any) => {
    setTenant((t: any) => ({ ...t, ...patch }));
    setTenantDirty(true);
    setMessage(null);
  };

  const editSettings = (patch: any) => {
    setSettings((s: any) => ({ ...s, ...patch }));
    setSettingsDirty(true);
    setMessage(null);
  };

  const saveTenant = async () => {
    setSavingTenant(true);
    setMessage(null);
    try {
      const resp = await apiClient.put("/tenant", {
        name: tenant.name,
        code: tenant.code,
        domain: tenant.domain || "",
        currency: tenant.currency || "",
        timezone: tenant.timezone,
        activePlan: tenant.activePlan || "",
      });
      setTenant(resp.data.data);
      setTenantDirty(false);
      setMessage({ kind: "ok", text: "Tenant profile saved." });
    } catch (err: any) {
      setMessage({ kind: "err", text: err.response?.data?.message || "Failed to save tenant profile." });
    }
    setSavingTenant(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    setMessage(null);
    try {
      const resp = await apiClient.put("/settings", {
        idleThresholdSeconds: Number(settings.idleThresholdSeconds),
        defaultWorkingHours: Number(settings.defaultWorkingHours),
        monthlySubmissionDay: Number(settings.monthlySubmissionDay),
        approvalWindowDay: Number(settings.approvalWindowDay),
      });
      setSettings(resp.data.data);
      setSettingsDirty(false);
      setMessage({ kind: "ok", text: "Configuration saved." });
    } catch (err: any) {
      setMessage({ kind: "err", text: err.response?.data?.message || "Failed to save configuration." });
    }
    setSavingSettings(false);
  };

  const input = "w-full px-3 py-2 border rounded";
  const label = "text-sm text-gray-500 mb-1 block";

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuration</h1>
        {(tenantDirty || settingsDirty) && (
          <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
        )}
      </div>

      {message && (
        <p className={`text-sm mb-4 ${message.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      {settings && (
        <div className="bg-white p-6 rounded shadow-sm mb-6">
          <h2 className="font-medium mb-4">Workforce Policies</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={label}>Idle Threshold</label>
              <select
                className={input}
                value={String(settings.idleThresholdSeconds || 60)}
                onChange={(e) => editSettings({ idleThresholdSeconds: Number(e.target.value) })}
              >
                <option value="60">1 minute (60 s)</option>
                <option value="300">5 minutes (300 s)</option>
                <option value="600">10 minutes (600 s)</option>
              </select>
            </div>
            <div>
              <label className={label}>Working Hours / Day (4–12)</label>
              <input
                type="number"
                min={4}
                max={12}
                className={input}
                value={settings.defaultWorkingHours ?? 8}
                onChange={(e) => editSettings({ defaultWorkingHours: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Plan Submission Deadline (day of month)</label>
              <input
                type="number"
                min={1}
                max={31}
                className={input}
                value={settings.monthlySubmissionDay ?? 25}
                onChange={(e) => editSettings({ monthlySubmissionDay: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Approval Window Closes (day of month)</label>
              <input
                type="number"
                min={1}
                max={31}
                className={input}
                value={settings.approvalWindowDay ?? 28}
                onChange={(e) => editSettings({ approvalWindowDay: e.target.value === "" ? "" : Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={saveSettings}
                disabled={savingSettings || !settingsDirty}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {savingSettings ? "Saving…" : "Save Policies"}
              </button>
            </div>
          </div>
        </div>
      )}

      {tenant && (
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="font-medium mb-4">Tenant Profile</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={label}>Company Name</label>
              <input
                className={input}
                value={tenant.name || ""}
                onChange={(e) => editTenant({ name: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Tenant Code</label>
              <input
                className={input}
                value={tenant.code || ""}
                onChange={(e) => editTenant({ code: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Domain</label>
              <input
                className={input}
                placeholder="techbd.com"
                value={tenant.domain || ""}
                onChange={(e) => editTenant({ domain: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Currency</label>
              <input
                className={input}
                placeholder="BDT"
                value={tenant.currency || ""}
                onChange={(e) => editTenant({ currency: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>Timezone</label>
              <select
                className={input}
                value={tenant.timezone || "Asia/Dhaka"}
                onChange={(e) => editTenant({ timezone: e.target.value })}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Active Plan</label>
              <input
                className={input}
                placeholder="e.g. Growth"
                value={tenant.activePlan || ""}
                onChange={(e) => editTenant({ activePlan: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={saveTenant}
                disabled={savingTenant || !tenantDirty}
                className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {savingTenant ? "Saving…" : "Save Tenant Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuration;
