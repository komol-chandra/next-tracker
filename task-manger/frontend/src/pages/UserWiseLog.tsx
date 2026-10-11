import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const UserWiseLog = () => {
  const { user, can, badges } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: "", to: "", status: "", category: "" });

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const resp = await apiClient.get("/reports/user-log", { 
          params: { userId: user?._id, from: filters.from, to: filters.to, status: filters.status, category: filters.category } 
        });
        setLogs(resp.data.data);
      } catch (err) {
        console.error("Failed to load user log:", err);
      }
      setLoading(false);
    };
    loadLogs();
  }, [user, filters]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User-wise Log</h1>
      {can("reports.user_log") ? (
        <div>
          <div className="bg-white p-4 rounded mb-4">
            <h3 className="font-medium">Filters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Date From</label>
                <input 
                  value={filters.from} 
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })} 
                  type="date" 
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Date To</label>
                <input 
                  value={filters.to} 
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })} 
                  type="date" 
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">All</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="p-3">User</th>
                    <th className="p-3">Dept</th>
                    <th className="p-3">Task</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3">Hours</th>
                    <th className="p-3">Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="p-3">{log.owner?.name || "Unknown"}</td>
                      <td className="p-3">{log.owner?.department || ""}</td>
                      <td className="p-3">{log.title || ""}</td>
                      <td className="p-3">{log.category || ""}</td>
                      <td className="p-3">{log.priority || ""}</td>
                      <td className="p-3">{log.status || ""}</td>
                      <td className="p-3">{log.createdAt ? log.createdAt.split("T")[0] : ""}</td>
                      <td className="p-3">{log.hoursLogged || 0}h</td>
                      <td className="p-3">{log.attachments || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-500">You don't have permission to view user log</p>
      )}
    </div>
  );
};

export default UserWiseLog;