const projectModel = require("../models/projectModel"); 

async function getProjects(req, res, next) {
  try {
    const projects = await projectModel.getAllProjects();
 
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
 // route params arrive on req.params -> /api/projects/:id

 try {
  const project = await projectModel.getProjectById(req.params.id);
 
  if (!project) {
    return res.status(404).json({
      success: false,
      message: `No project found with id ${req.params.id}`,
    });
  }
  
  res.status(200).json({ success: true, data: project });
 } catch (error) {
  next(error);
 }
}


async function createProject(req, res, next) {
 // request body arrives on req.body -> requires express.json() middleware

 try {
  if (!req.body.title) {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }
  
  const newProject = await projectModel.createProject(req.body);
  res.status(201).json({ success: true, data: newProject });
 } catch (error) {
  next(error);
 }
}

async function updateProject(req, res, next) {

  try {
    if (!req.body.title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }
  
    const updated = await projectModel.updateProject(req.params.id, req.body);
  
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `No project found with id ${req.params.id}`,
      });
    }
  
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error)
  }
}

async function deleteProject(req, res, next) {

  try {
    const deleted = await projectModel.deleteProject(req.params.id);
 
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `No project found with id ${req.params.id}`,
      });
    }
  
    res.status(200).json({ success: true, message: "Project deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
