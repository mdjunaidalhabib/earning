const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      enum: ["survey", "ad_view", "app_install", "social_follow", "offer", "custom"],
      required: [true, "Task category is required"],
    },
    rewardAmount: {
      type: Number,
      required: [true, "Reward amount is required"],
      min: [0.01, "Reward amount must be greater than 0"],
    },
    externalLink: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "External link must be a valid URL",
      },
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, "Instructions cannot exceed 1000 characters"],
    },
    proofRequired: {
      type: Boolean,
      default: true,
    },
    proofType: {
      type: String,
      enum: ["screenshot", "text", "link", "none"],
      default: "screenshot",
    },
    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    maxCompletions: {
      type: Number,
      default: null,
      min: [1, "Max completions must be at least 1"],
    },
    completedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, "Per-user limit must be at least 1"],
    },
    status: {
      type: String,
      enum: ["active", "paused", "expired"],
      default: "active",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ category: 1 });

taskSchema.virtual("isFull").get(function isFull() {
  return this.maxCompletions !== null && this.completedCount >= this.maxCompletions;
});

taskSchema.virtual("isExpired").get(function isExpired() {
  return this.expiresAt !== null && this.expiresAt.getTime() < Date.now();
});

taskSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
