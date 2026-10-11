import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AppContext";
import { apiClient } from "../services/apiClient";

const Org = () => {
  const { user, can } = useAuth();
  const [tree, setTree] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"tree" | "matrix">("tree");

  useEffect(() => {
    const load = async () => {
      try {
        const treeResp = await apiClient.get("/org/tree");
        setTree(treeResp.data.data);
        if (can("roles.manage")) {
          try {
            const matrixResp = await apiClient.get("/rbac/matrix");
            setMatrix(matrixResp.data.data);
          } catch {
            /* matrix is optional if forbidden */
          }
        }
      } catch (err) {
        console.error("Failed to load org data:", err);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!can("org.manage") && !can("roles.manage") && user?.role !== "Super Admin") {
    return <p className="text-red-500">You don't have permission to view org data</p>;
  }

  if (loading) return <div>Loading...</div>;

  const org = tree[0];
  const permKeys = matrix[0]?.permissions?.map((p: any) => p.key) || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Org & RBAC</h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm ${view === "tree" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
            onClick={() => setView("tree")}
          >
            Org Tree
          </button>
          {can("roles.manage") && (
            <button
              className={`px-3 py-1 rounded text-sm ${view === "matrix" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
              onClick={() => setView("matrix")}
            >
              RBAC Matrix
            </button>
          )}
        </div>
      </div>

      {view === "tree" && (
        <div>
          {org ? (
            <div className="bg-white p-4 rounded mb-4">
              <h2 className="font-medium text-lg">
                {org.tenant?.name} <span className="text-sm text-gray-500">({org.tenant?.code})</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 mt-3">
                {org.departments?.map((dept: any) => (
                  <div key={dept._id} className="border rounded p-3">
                    <h3 className="font-medium">{dept.name} <span className="text-xs text-gray-500">{dept.code}</span></h3>
                    {dept.teams?.length > 0 ? (
                      dept.teams.map((team: any) => (
                        <div key={team._id} className="ml-3 mt-2">
                          <p className="text-sm font-medium text-gray-700">
                            {team.name} {team.lead && <span className="text-gray-500 font-normal">— lead: {team.lead.name}</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {team.members?.length > 0
                              ? team.members.map((m: any) => `${m.name} (${m.role})`).join(", ")
                              : "No members"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 ml-3">No teams</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No organization data found</p>
          )}
        </div>
      )}

      {view === "matrix" && (
        <div className="overflow-x-auto">
          {matrix.length > 0 ? (
            <table className="min-w-full bg-white rounded">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Scope</th>
                  {permKeys.map((k: string) => (
                    <th key={k} className="p-2 text-xs text-gray-500 whitespace-nowrap" title={k}>
                      {k.split(".")[1] || k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((role: any) => (
                  <tr key={role.roleId} className="border-b last:border-0">
                    <td className="p-3 font-medium">{role.roleName}</td>
                    <td className="p-3 text-sm text-gray-500">{role.scope}</td>
                    {role.permissions.map((p: any) => (
                      <td key={p.key} className="p-2 text-center">
                        {p.value ? <span className="text-green-600">✓</span> : <span className="text-gray-300">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No roles found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Org;
