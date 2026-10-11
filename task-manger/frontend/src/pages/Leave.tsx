import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const Leave = () => {
  const { user, can } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "Casual", startDate: "", endDate: "", reason: "" });
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const loadData = async () => {
    try {
      const [leaveResp, holidayResp, balResp] = await Promise.all([
        apiClient.get("/leaves"),
        apiClient.get("/holidays"),
        apiClient.get("/leaves/balance"),
      ]);
      setLeaves(leaveResp.data.data);
      setHolidays(holidayResp.data.data);
      setBalance(balResp.data.data);
    } catch (err) {
      console.error("Failed to load leave data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const applyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      await apiClient.post("/leaves", form);
      setForm({ type: "Casual", startDate: "", endDate: "", reason: "" });
      setShowForm(false);
      setMsg("Leave request submitted");
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply for leave");
    }
  };

  const decide = async (id: string, status: "Approved" | "Rejected") => {
    setError("");
    setMsg("");
    try {
      await apiClient.put(`/leaves/${id}/status`, { status });
      setMsg(`Leave ${status.toLowerCase()}`);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update leave");
    }
  };

  if (!can("leave.request") && !can("leave.approve")) {
    return <p className="text-red-500">You don't have permission to manage leaves</p>;
  }

  if (loading) return <div>Loading...</div>;

  const pending = leaves.filter((l) => l.status !== "Approved" && l.status !== "Rejected");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leave & Holidays</h1>
        {can("leave.request") && (
          <button className="bg-green-500 text-white px-4 py-1 rounded" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Apply Leave"}
          </button>
        )}
      </div>

      {msg && <p className="text-green-600 mb-3">{msg}</p>}
      {error && <p className="text-red-500 mb-3">{error}</p>}

      {balance && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Casual", used: balance.casualUsed, total: balance.casualTotal },
            { label: "Sick", used: balance.sickUsed, total: balance.sickTotal },
            { label: "Annual", used: balance.annualUsed, total: balance.annualTotal },
            { label: "Unpaid", used: balance.unpaidUsed, total: "-" },
          ].map((b) => (
            <div key={b.label} className="bg-white p-4 rounded">
              <p className="text-sm text-gray-500">{b.label} Leave</p>
              <p className="text-xl font-semibold">
                {b.total === "-" ? b.used : `${b.used} / ${b.total}`} days
              </p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={applyLeave} className="bg-white p-4 rounded mb-4 grid grid-cols-5 gap-3">
          <select className="border p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["Casual", "Sick", "Annual", "Unpaid"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="date" className="border p-2" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <input type="date" className="border p-2" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          <input className="border p-2 col-span-2" placeholder="Reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button type="submit" className="bg-green-500 text-white px-4 py-1 rounded col-span-5 justify-self-start">Submit</button>
          {error && <p className="col-span-5 text-red-500 text-sm">{error}</p>}
        </form>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium mb-2">My Requests</h2>
          {leaves.length > 0 ? (
            <table className="min-w-full bg-white rounded">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Dates</th>
                  <th className="p-3 text-left">Days</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l._id} className="border-b last:border-0">
                    <td className="p-3">{l.type}</td>
                    <td className="p-3 text-sm">
                      {new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{l.days}</td>
                    <td className="p-3">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No leave requests</p>
          )}

          {can("leave.approve") && (
            <div className="mt-6 bg-white p-4 rounded">
              <h2 className="font-medium mb-2">Pending Approvals</h2>
              {pending.length === 0 ? (
                <p className="text-sm text-gray-500">No pending approvals</p>
              ) : (
                pending.map((l) => (
                  <div key={l._id} className="flex items-center justify-between border-b last:border-0 py-2">
                    <div>
                      <p className="text-sm font-medium">{l.applicantName} — {l.type}</p>
                      <p className="text-xs text-gray-500">{l.days} days · {l.status}</p>
                    </div>
                    <div>
                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm mr-2" onClick={() => decide(l._id, "Approved")}>Approve</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded text-sm" onClick={() => decide(l._id, "Rejected")}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-medium mb-2">Holidays</h2>
          {holidays.length > 0 ? (
            <table className="min-w-full bg-white rounded">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h._id} className="border-b last:border-0">
                    <td className="p-3">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="p-3">{h.title}</td>
                    <td className="p-3">{h.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No holidays configured</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leave;
