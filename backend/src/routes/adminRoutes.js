const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getPendingSubmissions,
  reviewSubmission,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.use(protect, isAdmin);

router.get("/dashboard-stats", getDashboardStats);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", updateUserStatus);

router.get("/submissions", getPendingSubmissions);
router.patch("/submissions/:id/review", reviewSubmission);

module.exports = router;
