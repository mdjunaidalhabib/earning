const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Withdrawal amount is required"],
      min: [1, "Withdrawal amount must be greater than 0"],
    },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "bank_transfer"],
      required: [true, "Withdrawal method is required"],
    },
    accountDetails: {
      accountName: {
        type: String,
        required: [true, "Account holder name is required"],
        trim: true,
      },
      accountNumber: {
        type: String,
        required: [true, "Account number is required"],
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
        default: "",
      },
      branchName: {
        type: String,
        trim: true,
        default: "",
      },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: [300, "Admin note cannot exceed 300 characters"],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [300, "Rejection reason cannot exceed 300 characters"],
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    transactionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  { timestamps: true }
);

withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
