import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// Wallet validation
export const validateWalletChallenge = [
  body("address")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Valid wallet address required"),
  handleValidationErrors,
];

export const validateWalletVerify = [
  body("address")
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Valid wallet address required"),
  body("signedMessage")
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Valid signed message required"),
  body("challengeMessage")
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Valid challenge message required"),
  handleValidationErrors,
];

// Wish validation
export const validateCreateWish = [
  body("title")
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be 3-100 characters"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be 10-1000 characters"),
  body("category")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be 1-50 characters"),
  body("stakeAmount")
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage("Stake amount must be between 0.01 and 10000 TON"),
  body("deadline")
    .isISO8601()
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      const minDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const maxDeadline = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

      if (deadline <= now) {
        throw new Error("Deadline must be in the future");
      }
      if (deadline < minDeadline) {
        throw new Error("Deadline must be at least 24 hours from now");
      }
      if (deadline > maxDeadline) {
        throw new Error("Deadline cannot be more than 1 year from now");
      }
      return true;
    }),
  body("validatorMode")
    .isIn(["community", "designatedValidators"])
    .withMessage(
      "Validator mode must be 'community' or 'designatedValidators'",
    ),
  body("validators")
    .optional()
    .isArray({ min: 0, max: 10 })
    .withMessage("Validators must be an array of up to 10 addresses"),
  body("validators.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each validator must be a valid address"),
  handleValidationErrors,
];

// Pledge validation
export const validatePledge = [
  body("amount")
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage("Pledge amount must be between 0.01 and 1000 TON"),
  handleValidationErrors,
];

// Proof validation
export const validateProof = [
  body("caption")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Caption cannot exceed 500 characters"),
  handleValidationErrors,
];

// Vote validation
export const validateVote = [
  body("choice")
    .isIn(["yes", "no"])
    .withMessage("Choice must be 'yes' or 'no'"),
  handleValidationErrors,
];

// Profile validation
export const validateProfile = [
  body("displayName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Display name must be 1-50 characters"),
  body("avatarUrl")
    .optional()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),
  handleValidationErrors,
];

// ID parameter validation
export const validateId = [
  param("id").isMongoId().withMessage("Invalid ID format"),
  handleValidationErrors,
];

export const validateWishId = [
  param("wishId").isMongoId().withMessage("Invalid wish ID format"),
  handleValidationErrors,
];

export const validateProofId = [
  param("proofId").isMongoId().withMessage("Invalid proof ID format"),
  handleValidationErrors,
];

// Query parameter validation
export const validatePagination = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("cursor").optional().isMongoId().withMessage("Invalid cursor format"),
  handleValidationErrors,
];

export const validateSearch = [
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be 1-100 characters"),
  handleValidationErrors,
];
