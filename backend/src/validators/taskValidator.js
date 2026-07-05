const { body, param } = require("express-validator");

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ max: 120 })
    .withMessage("Title cannot exceed 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Task description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["survey", "ad_view", "app_install", "social_follow", "offer", "custom"])
    .withMessage("Invalid task category"),

  body("rewardAmount")
    .notEmpty()
    .withMessage("Reward amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Reward amount must be greater than 0"),

  body("externalLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("External link must be a valid URL"),

  body("proofRequired")
    .optional()
    .isBoolean()
    .withMessage("proofRequired must be a boolean"),

  body("proofType")
    .optional()
    .isIn(["screenshot", "text", "link", "none"])
    .withMessage("Invalid proof type"),

  body("maxCompletions")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Max completions must be at least 1"),

  body("perUserLimit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Per-user limit must be at least 1"),

  body("expiresAt")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("expiresAt must be a valid date"),
];

const updateTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  ...createTaskValidator.map((rule) => rule.optional()),
];

const submitTaskValidator = [
  param("id").isMongoId().withMessage("Invalid task ID"),

  body("proof.type")
    .optional()
    .isIn(["screenshot", "text", "link", "none"])
    .withMessage("Invalid proof type"),

  body("proof.value")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Proof value cannot exceed 500 characters"),
];

module.exports = { createTaskValidator, updateTaskValidator, submitTaskValidator };
