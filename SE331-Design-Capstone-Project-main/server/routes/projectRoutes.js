const express = require("express");
const router = express.Router();

const { getProjects, getProject, createProject, updateProject, deleteProject } = require("../controllers/projectController");

router.get("/", getProjects);        // GET    /api/projects
router.get("/:id", getProject);      // GET    /api/projects/:id
router.post("/", createProject);     // POST   /api/projects
router.put("/:id", updateProject);     // PUT    /api/projects/:id
router.delete("/:id", deleteProject);  // DELETE /api/projects/:id
 
module.exports = router;