const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "task_earning",
        "referral_bonus",
        "withdrawal",
        "admin_credit",
        "admin_debit",
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    relatedWithdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdrawal",
      default: null,
    },
    relatedReferral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      default: null,
    },
    proof: {
      type: {
        type: String,
        enum: ["screenshot", "text", "link", "none"],
        default: "none",
      },
      value: { type: String, default: "" },
    },
    balanceAfter: {
      type: Number,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [300, "Rejection reason cannot exceed 300 characters"],
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
