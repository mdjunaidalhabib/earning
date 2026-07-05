const express = require("express");
const router = express.Router();

const {
  getTasks,
  getTaskById,
  submitTask,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
} = require("../controllers/taskController");

const {
  createTaskValidator,
  updateTaskValidator,
  submitTaskValidator,
} = require("../validators/taskValidator");

const validate = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.use(protect);

// Admin-only management routes
router.get("/admin/all", isAdmin, getAllTasksAdmin);
router.post("/", isAdmin, createTaskValidator, validate, createTask);
router.patch("/:id", isAdmin, updateTaskValidator, validate, updateTask);
router.delete("/:id", isAdmin, deleteTask);

// User-facing routes
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.post("/:id/submit", submitTaskValidator, validate, submitTask);

module.exports = router;
