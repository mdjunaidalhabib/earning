const Task = require("../models/Task");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError, sendSuccess } = require("../utils/apiResponse");

/**
 * @route   GET /api/v1/tasks
 * @access  Private
 * Lists active, non-expired tasks available to the logged-in user,
 * annotated with the user's own submission count per task.
 */
const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
  const skip = (page - 1) * limit;

  const filter = {
    status: "active",
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };
  if (req.query.category) filter.category = req.query.category;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  const taskIds = tasks.map((t) => t._id);
  const submissionCounts = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: "task_earning",
        relatedTask: { $in: taskIds },
        status: { $ne: "rejected" },
      },
    },
    { $group: { _id: "$relatedTask", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(submissionCounts.map((s) => [s._id.toString(), s.count]));

  const enriched = tasks.map((task) => ({
    ...task,
    userSubmissionCount: countMap.get(task._id.toString()) || 0,
    isAvailableForUser:
      (countMap.get(task._id.toString()) || 0) < task.perUserLimit &&
      (task.maxCompletions === null || task.completedCount < task.maxCompletions),
  }));

  sendSuccess(res, 200, "Tasks fetched", enriched, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const userSubmissionCount = await Transaction.countDocuments({
    user: req.user._id,
    type: "task_earning",
    relatedTask: task._id,
    status: { $ne: "rejected" },
  });

  sendSuccess(res, 200, "Task fetched", {
    ...task,
    userSubmissionCount,
    isAvailableForUser: userSubmissionCount < task.perUserLimit,
  });
});

/**
 * @route   POST /api/v1/tasks/:id/submit
 * @access  Private
 * Creates a pending task_earning transaction. Admin must approve before
 * the reward is credited to the user's balance.
 */
const submitTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.status !== "active") {
    throw new ApiError(400, "This task is no longer active");
  }

  if (task.expiresAt && task.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "This task has expired");
  }

  if (task.maxCompletions !== null && task.completedCount >= task.maxCompletions) {
    throw new ApiError(400, "This task has reached its completion limit");
  }

  const existingSubmissions = await Transaction.countDocuments({
    user: req.user._id,
    type: "task_earning",
    relatedTask: task._id,
    status: { $ne: "rejected" },
  });

  if (existingSubmissions >= task.perUserLimit) {
    throw new ApiError(
      400,
      "You have already completed this task the maximum number of times"
    );
  }

  if (task.proofRequired && !req.body?.proof?.value) {
    throw new ApiError(400, "Proof of completion is required for this task");
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type: "task_earning",
    amount: task.rewardAmount,
    status: "pending",
    description: `Submission for task: ${task.title}`,
    relatedTask: task._id,
    proof: {
      type: req.body?.proof?.type || "none",
      value: req.body?.proof?.value || "",
    },
  });

  sendSuccess(res, 201, "Task submitted successfully. Awaiting admin review.", transaction);
});

/**
 * @route   POST /api/v1/tasks
 * @access  Private/Admin
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  sendSuccess(res, 201, "Task created successfully", task);
});

/**
 * @route   PATCH /api/v1/tasks/:id
 * @access  Private/Admin
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  sendSuccess(res, 200, "Task updated successfully", task);
});

/**
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private/Admin
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  sendSuccess(res, 200, "Task deleted successfully");
});

/**
 * @route   GET /api/v1/tasks/admin/all
 * @access  Private/Admin
 * Unfiltered list for the admin task-management table.
 */
const getAllTasksAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  sendSuccess(res, 200, "Tasks fetched", tasks, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

module.exports = {
  getTasks,
  getTaskById,
  submitTask,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
};
