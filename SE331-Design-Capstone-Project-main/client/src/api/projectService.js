import axiosClient from "./axiosClient";
 
export async function getProjects() {
  const response = await axiosClient.get("/projects");
  return response.data; // { response => success, data }
}

export async function getProjectById(id) {
  const response = await axiosClient.get(`/projects/${id}`);
  return response.data;
}

export async function createProject(projectData){
  const response = await axiosClient.post("/projects", projectData);
  return response.data;
}

export async function updateProject(id, projectData) {
  const response = await axiosClient.put(`/projects/${id}`, projectData);
  return response.data; // { success, data }
}
 
export async function deleteProject(id) {
  const response = await axiosClient.delete(`/projects/${id}`);
  return response.data; // { success, message }
}