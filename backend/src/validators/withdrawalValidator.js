const { body, param } = require("express-validator");

const createWithdrawalValidator = [
  body("amount")
    .notEmpty()
    .withMessage("Withdrawal amount is required")
    .isFloat({ min: 1 })
    .withMessage("Withdrawal amount must be greater than 0"),

  body("method")
    .notEmpty()
    .withMessage("Withdrawal method is required")
    .isIn(["bkash", "nagad", "rocket", "bank_transfer"])
    .withMessage("Invalid withdrawal method"),

  body("accountDetails.accountName")
    .trim()
    .notEmpty()
    .withMessage("Account holder name is required"),

  body("accountDetails.accountNumber")
    .trim()
    .notEmpty()
    .withMessage("Account number is required")
    .isLength({ min: 5, max: 34 })
    .withMessage("Account number must be between 5 and 34 characters"),

  body("accountDetails.bankName")
    .if(body("method").equals("bank_transfer"))
    .trim()
    .notEmpty()
    .withMessage("Bank name is required for bank transfers"),
];

const updateWithdrawalStatusValidator = [
  param("id").isMongoId().withMessage("Invalid withdrawal ID"),

  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["processing", "approved", "rejected", "completed"])
    .withMessage("Invalid withdrawal status"),

  body("adminNote")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Admin note cannot exceed 300 characters"),

  body("rejectionReason")
    .if(body("status").equals("rejected"))
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required when rejecting a withdrawal"),
];

module.exports = { createWithdrawalValidator, updateWithdrawalStatusValidator };
