import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const Settings = () => {
  const { user, can } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const resp = await apiClient.get("/settings");
        setSettings(resp.data.data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
      setLoading(false);
    };
    loadSettings();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  if (!can("settings.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to edit settings</p>;
  }

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const resp = await apiClient.put("/settings", {
        idleThresholdSeconds: settings.idleThresholdSeconds,
        defaultWorkingHours: settings.defaultWorkingHours,
      });
      setSettings(resp.data.data);
      setMessage("Settings saved.");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Save failed.");
    }
    setSaving(false);
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {message && <p className="text-sm text-green-700 mb-4">{message}</p>}
      {settings && (
        <div className="bg-white p-6 rounded shadow-sm max-w-xl">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Idle Threshold (minutes)</h3>
              <input
                type="number"
                min={30}
                value={Math.round((settings.idleThresholdSeconds || 60) / 60)}
                onChange={(e) =>
                  setSettings({ ...settings, idleThresholdSeconds: Number(e.target.value) * 60 })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <h3 className="text-sm text-gray-500 mb-1">Working Hours/Day</h3>
              <input
                type="number"
                min={1}
                max={12}
                value={settings.defaultWorkingHours || 8}
                onChange={(e) =>
                  setSettings({ ...settings, defaultWorkingHours: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
