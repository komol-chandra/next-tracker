import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";
import { useParams } from "react-router-dom";

const Configuration = () => {
  const { user, can } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [setResp, tenResp] = await Promise.all([
          apiClient.get("/settings"),
          apiClient.get("/tenant"),
        ]);
        setSettings(setResp.data.data);
        setTenant(tenResp.data.data);
      } catch (err) {
        console.error("Failed to load configuration data:", err);
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (!can("settings.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to view settings</p>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configuration</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm text-gray-500">Idle Threshold</h3>
          <p>{settings?.idleThresholdSeconds} seconds</p>
          <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => setSettings({ ...settings, idleThresholdSeconds: 300 })}>
            300s
          </button>
          <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm" onClick={() => setSettings({ ...settings, idleThresholdSeconds: 600 })}>
            600s
          </button>
        </div>
        <div>
          <h3 className="text-sm text-gray-500">Working Hours/Day</h3>
          <p>{settings?.defaultWorkingHours}h</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-500">Plan Submission Deadline</h3>
          <p>{settings?.monthlySubmissionDay}th</p>
        </div>
        <div>
          <h3 className="text-sm text-gray-500">Approval Window</h3>
          <p>{settings?.approvalWindowDay}th</p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm text-gray-500">Tenant Profile</h3>
        {tenant && (
          <div>
            <p>Name: {tenant.name}</p>
            <p>Code: {tenant.code}</p>
            <p>Currency: {tenant.currency || "BDT"}</p>
            <p>Timezone: {tenant.timezone}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuration;