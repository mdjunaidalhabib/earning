const express = require("express");
const router = express.Router();

const {
  createWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,
  getAllWithdrawalsAdmin,
  updateWithdrawalStatus,
} = require("../controllers/withdrawalController");

const {
  createWithdrawalValidator,
  updateWithdrawalStatusValidator,
} = require("../validators/withdrawalValidator");

const validate = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.use(protect);

// Admin-only
router.get("/admin/all", isAdmin, getAllWithdrawalsAdmin);
router.patch(
  "/:id/status",
  isAdmin,
  updateWithdrawalStatusValidator,
  validate,
  updateWithdrawalStatus
);

// User-facing
router.post("/", createWithdrawalValidator, validate, createWithdrawal);
router.get("/", getMyWithdrawals);
router.patch("/:id/cancel", cancelWithdrawal);

module.exports = router;
