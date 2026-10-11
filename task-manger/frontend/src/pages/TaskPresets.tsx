import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const TaskPresets = () => {
  const { user, can } = useAuth();
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        const resp = await apiClient.get("/task-presets");
        setPresets(resp.data.data);
      } catch (err) {
        console.error("Failed to load task presets:", err);
      }
      setLoading(false);
    };
    loadPresets();
  }, [user]);

  if (!can("presets.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to view task presets</p>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Task Presets</h1>
      {can("presets.manage") ? (
        <div className="bg-white p-4 rounded mb-4">
          <h3 className="font-medium">Manage Presets</h3>
          <p className="text-sm text-gray-500">Add, edit, or publish task presets</p>
          <button className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded">Add New Preset</button>
        </div>
      ) : (
        <div className="bg-white p-4 rounded">
          <h3 className="font-medium">Published Presets</h3>
          <p className="text-sm text-gray-500">Available for task selection</p>
        </div>
      )}
      
      {presets.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white rounded">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Target</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {presets.map((p) => (
                <tr key={p._id}>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category || ""}</td>
                  <td className="p-3">{p.frequency || ""}</td>
                  <td className="p-3">{p.defaultTarget}</td>
                  <td className="p-3"><span className={p.status === "Published" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}>{p.status}</span></td>
                  <td className="p-3">
                    <button className="text-blue-600 text-sm hover:underline">Edit</button>
                    <button className="text-green-600 text-sm hover:underline ml-2">Publish/Unpublish</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No presets found</p>
      )}
    </div>
  );
};

export default TaskPresets;