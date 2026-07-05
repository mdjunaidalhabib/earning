const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getDashboardSummary,
  getMyTransactions,
  getMyReferrals,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/transactions", getMyTransactions);
router.get("/referrals", getMyReferrals);

module.exports = router;
