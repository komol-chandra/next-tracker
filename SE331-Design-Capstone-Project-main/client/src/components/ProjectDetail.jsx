import React from 'react'
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  deleteProject,
} from "../api/projectService";

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // lets code change the page
    const [project, setProject] = useState(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProject() {
          try {
            const result = await getProjectById(id);
            setProject(result.data);
            setTitle(result.data.title);
          } catch (err) {
            setError("Could not load project");
          }
        }
        fetchProject();
    }, [id]);

    async function handleUpdate(e) {
      e.preventDefault();
      try {
        const result = await updateProject(id, { title });
        setProject(result.data); // heading updates = feedback that it worked
      } catch (err) {
        alert("Update failed - Title is required.");
      }
    }

    async function handleDelete() {
        await deleteProject(id);
        navigate("/"); // back to the list
    }

    
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!project) return <p>Loading...</p>;


  return (
    <div>
        <Link to="/">Back to Projects</Link>
        <h2>{project.title}</h2>
        <p>Project ID: {project._id} </p>

        <form onSubmit={handleUpdate}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <button type="submit">Save</button>
        </form>
 
        <button onClick={handleDelete}>Delete Project</button>
    </div>
  );
}

export default ProjectDetail