import React, { useEffect, useState } from 'react'
import { getProjects, createProject } from "../api/projectService";
import { Link } from "react-router-dom"

const Home = () => {
    const [fixed, setFixed] =useState("fixed");
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState("");

    async function fetchProjects() {
        try {
            setLoading(true);
            const result = await getProjects(); 
            setProjects(result.data);
            setError(null);
        } catch (err) {
            setError("Could not load projects. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {    
        fetchProjects();
    }, []); // empty dependency array -> runs once, when the component mounts

    async function handleCreate(e){
        e.preventDefault();
        try {
            const result = await createProject({title});
            fetchProjects();
        } catch (error) {
            alert("Could not add project");
        }
    }

  return (
    <div>
        <div className={fixed==="fixed"? "hero hero-fixed" : "hero hero-sliding"}>
            <div className='hero-overlay'>
            <h1>Welcome Back!</h1>
            <button onClick={()=> setFixed(fixed==="fixed"? "sliding": "fixed")}>Change BG</button>
        </div>
        </div>
        

        <h2>Projects</h2>
        {loading && <p>Loading projects...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        {!loading && !error && ( 
            <div className='card-list'>
                {projects.map((project) =>(
                    <Link 
                    to={`/projects/${project._id}`} 
                    className='card' 
                    key={project._id}>
                        {project.title}
                    </Link>
                ))}
            </div>
        )}

        <h2>Create a new project</h2>
        <form onSubmit={handleCreate}>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder='enter title'/>
            <button type='submit'>Create</button>
        </form>
    </div>
  );
}

export default Home