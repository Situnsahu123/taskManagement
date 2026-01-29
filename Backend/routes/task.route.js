import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskByname,
  getStatusUSer,
} from "../controller/taskController.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask); 
router.get("/", getTasks); 
router.get("/:id", getTask); 
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/byusername", getTaskByname);
router.get("/stats", getStatusUSer);

export default router;
