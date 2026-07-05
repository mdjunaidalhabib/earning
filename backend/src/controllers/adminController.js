const User = require("../models/User");
const Task = require("../models/Task");
const Transaction = require("../models/Transaction");
const Withdrawal = require("../models/Withdrawal");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError, sendSuccess } = require("../utils/apiResponse");

/**
 * @route   GET /api/v1/admin/dashboard-stats
 * @access  Private/Admin
 * Aggregate figures + a 14-day earnings trend for the admin overview charts.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [
    totalUsers,
    activeUsers,
    totalTasks,
    activeTasks,
    pendingSubmissions,
    pendingWithdrawals,
    totalPaidOutAgg,
    totalPendingWithdrawalAgg,
    dailyEarningsTrend,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", isActive: true }),
    Task.countDocuments(),
    Task.countDocuments({ status: "active" }),
    Transaction.countDocuments({ type: "task_earning", status: "pending" }),
    Withdrawal.countDocuments({ status: "pending" }),
    Withdrawal.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Withdrawal.aggregate([
      { $match: { status: { $in: ["pending", "processing"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          type: "task_earning",
          status: { $in: ["completed", "approved"] },
          createdAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  sendSuccess(res, 200, "Dashboard stats fetched", {
    totalUsers,
    activeUsers,
    totalTasks,
    activeTasks,
    pendingSubmissions,
    pendingWithdrawals,
    totalPaidOut: totalPaidOutAgg[0]?.total || 0,
    totalPendingWithdrawalAmount: totalPendingWithdrawalAgg[0]?.total || 0,
    dailyEarningsTrend: dailyEarningsTrend.map((d) => ({
      date: d._id,
      total: d.total,
    })),
  });
});

/**
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { role: "user" };
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Users fetched", users, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  sendSuccess(res, 200, "User fetched", user);
});

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Private/Admin
 * Toggles a user's isActive (suspend/reactivate) status.
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role === "admin") {
    throw new ApiError(403, "Cannot change status of an admin account");
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, `User ${isActive ? "reactivated" : "suspended"} successfully`, user.toSafeObject());
});

/**
 * @route   GET /api/v1/admin/submissions
 * @access  Private/Admin
 * Pending task_earning transactions awaiting review, oldest first.
 */
const getPendingSubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { type: "task_earning", status: "pending" };

  const [submissions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("relatedTask", "title category rewardAmount proofType")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Pending submissions fetched", submissions, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   PATCH /api/v1/admin/submissions/:id/review
 * @access  Private/Admin
 * Approves or rejects a pending task_earning transaction. Approval credits
 * the reward to the user's balance and increments the task's completedCount.
 */
const reviewSubmission = asyncHandler(async (req, res) => {
  const { decision, rejectionReason } = req.body; // decision: "approve" | "reject"

  if (!["approve", "reject"].includes(decision)) {
    throw new ApiError(400, "Decision must be either 'approve' or 'reject'");
  }

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    throw new ApiError(404, "Submission not found");
  }
  if (transaction.status !== "pending") {
    throw new ApiError(400, `This submission has already been ${transaction.status}`);
  }

  if (decision === "reject") {
    if (!rejectionReason) {
      throw new ApiError(400, "Rejection reason is required");
    }
    transaction.status = "rejected";
    transaction.rejectionReason = rejectionReason;
    transaction.reviewedBy = req.user._id;
    transaction.reviewedAt = new Date();
    await transaction.save();

    return sendSuccess(res, 200, "Submission rejected", transaction);
  }

  // Approve path — credit user and bump task completion counter
  const user = await User.findById(transaction.user);
  if (!user) {
    throw new ApiError(404, "Associated user not found");
  }

  user.balance += transaction.amount;
  user.totalEarned += transaction.amount;
  await user.save({ validateBeforeSave: false });

  if (transaction.relatedTask) {
    await Task.findByIdAndUpdate(transaction.relatedTask, {
      $inc: { completedCount: 1 },
    });
  }

  transaction.status = "completed";
  transaction.reviewedBy = req.user._id;
  transaction.reviewedAt = new Date();
  transaction.balanceAfter = user.balance;
  await transaction.save();

  sendSuccess(res, 200, "Submission approved and reward credited", transaction);
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getPendingSubmissions,
  reviewSubmission,
};
