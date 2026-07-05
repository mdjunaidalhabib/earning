const Withdrawal = require("../models/Withdrawal");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError, sendSuccess } = require("../utils/apiResponse");
const env = require("../config/env");

/**
 * @route   POST /api/v1/withdrawals
 * @access  Private
 * Reserves the requested amount from the user's balance immediately
 * (moved to "pending withdrawal" state) so it can't be double-spent
 * while the admin reviews the request. Refunded automatically on rejection.
 */
const createWithdrawal = asyncHandler(async (req, res) => {
  const { amount, method, accountDetails } = req.body;

  if (amount < env.MIN_WITHDRAWAL_AMOUNT) {
    throw new ApiError(
      400,
      `Minimum withdrawal amount is ${env.MIN_WITHDRAWAL_AMOUNT}`
    );
  }

  const user = await User.findById(req.user._id);

  if (user.balance < amount) {
    throw new ApiError(400, "Insufficient balance for this withdrawal");
  }

  // Reserve funds immediately
  user.balance -= amount;
  await user.save({ validateBeforeSave: false });

  const withdrawal = await Withdrawal.create({
    user: user._id,
    amount,
    method,
    accountDetails,
    status: "pending",
  });

  const transaction = await Transaction.create({
    user: user._id,
    type: "withdrawal",
    amount,
    status: "pending",
    description: `Withdrawal request via ${method}`,
    relatedWithdrawal: withdrawal._id,
    balanceAfter: user.balance,
  });

  withdrawal.transactionRef = transaction._id;
  await withdrawal.save();

  sendSuccess(res, 201, "Withdrawal request submitted successfully", withdrawal);
});

/**
 * @route   GET /api/v1/withdrawals
 * @access  Private
 */
const getMyWithdrawals = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Withdrawal.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Withdrawals fetched", withdrawals, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   PATCH /api/v1/withdrawals/:id/cancel
 * @access  Private
 * User-initiated cancellation of their own still-pending request. Refunds
 * the reserved balance back to the user.
 */
const cancelWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!withdrawal) {
    throw new ApiError(404, "Withdrawal request not found");
  }

  if (withdrawal.status !== "pending") {
    throw new ApiError(400, "Only pending withdrawal requests can be cancelled");
  }

  const user = await User.findById(req.user._id);
  user.balance += withdrawal.amount;
  await user.save({ validateBeforeSave: false });

  withdrawal.status = "rejected";
  withdrawal.rejectionReason = "Cancelled by user";
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  if (withdrawal.transactionRef) {
    await Transaction.findByIdAndUpdate(withdrawal.transactionRef, {
      status: "rejected",
      rejectionReason: "Cancelled by user",
      reviewedAt: new Date(),
      balanceAfter: user.balance,
    });
  }

  sendSuccess(res, 200, "Withdrawal request cancelled and balance refunded", withdrawal);
});

/**
 * @route   GET /api/v1/withdrawals/admin/all
 * @access  Private/Admin
 */
const getAllWithdrawalsAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.method) filter.method = req.query.method;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email phone")
      .lean(),
    Withdrawal.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Withdrawals fetched", withdrawals, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   PATCH /api/v1/withdrawals/:id/status
 * @access  Private/Admin
 * Approves, processes, completes, or rejects a withdrawal. Rejection
 * refunds the reserved balance back to the user; completion updates
 * their lifetime totalWithdrawn figure.
 */
const updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const { status, adminNote, rejectionReason } = req.body;

  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) {
    throw new ApiError(404, "Withdrawal request not found");
  }

  if (["completed", "rejected"].includes(withdrawal.status)) {
    throw new ApiError(400, `This withdrawal has already been ${withdrawal.status}`);
  }

  const user = await User.findById(withdrawal.user);
  if (!user) {
    throw new ApiError(404, "Associated user not found");
  }

  if (status === "rejected") {
    user.balance += withdrawal.amount;
    await user.save({ validateBeforeSave: false });
  }

  if (status === "completed") {
    user.totalWithdrawn += withdrawal.amount;
    await user.save({ validateBeforeSave: false });
  }

  withdrawal.status = status;
  withdrawal.adminNote = adminNote || withdrawal.adminNote;
  if (status === "rejected") withdrawal.rejectionReason = rejectionReason;
  withdrawal.processedBy = req.user._id;
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  if (withdrawal.transactionRef) {
    await Transaction.findByIdAndUpdate(withdrawal.transactionRef, {
      status: status === "rejected" ? "rejected" : status === "completed" ? "completed" : "pending",
      rejectionReason: status === "rejected" ? rejectionReason : undefined,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      balanceAfter: user.balance,
    });
  }

  sendSuccess(res, 200, `Withdrawal ${status} successfully`, withdrawal);
});

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
  cancelWithdrawal,
  getAllWithdrawalsAdmin,
  updateWithdrawalStatus,
};
