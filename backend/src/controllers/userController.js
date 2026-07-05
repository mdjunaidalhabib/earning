const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Referral = require("../models/Referral");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError, sendSuccess } = require("../utils/apiResponse");

/**
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Profile fetched", { user: req.user.toSafeObject() });
});

/**
 * @route   PATCH /api/v1/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, "Profile updated successfully", { user: user.toSafeObject() });
});

/**
 * @route   GET /api/v1/users/dashboard-summary
 * @access  Private
 * Returns balance, lifetime earnings, pending earnings, and referral stats
 * for the logged-in user's dashboard overview cards.
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [pendingAgg, thisMonthAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, status: "pending", type: "task_earning" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: userId,
          status: { $in: ["completed", "approved"] },
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  sendSuccess(res, 200, "Dashboard summary fetched", {
    balance: req.user.balance,
    totalEarned: req.user.totalEarned,
    totalWithdrawn: req.user.totalWithdrawn,
    pendingEarnings: pendingAgg[0]?.total || 0,
    earnedThisMonth: thisMonthAgg[0]?.total || 0,
    referralCode: req.user.referralCode,
    referralCount: req.user.referralCount,
  });
});

/**
 * @route   GET /api/v1/users/transactions
 * @access  Private
 * Paginated ledger of the user's own transactions.
 */
const getMyTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("relatedTask", "title category rewardAmount")
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Transactions fetched", transactions, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/v1/users/referrals
 * @access  Private
 * List of people the logged-in user has referred, with bonus status.
 */
const getMyReferrals = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ referrer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("referee", "name email createdAt")
    .lean();

  sendSuccess(res, 200, "Referrals fetched", referrals);
});

module.exports = {
  getProfile,
  updateProfile,
  getDashboardSummary,
  getMyTransactions,
  getMyReferrals,
};
