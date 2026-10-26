import { body } from 'express-validator';

export const createFeeStructureRules = [
  body('classGrade')
    .notEmpty()
    .withMessage('Class / Grade is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Class name must be between 1 and 50 characters'),
  body('academicSession')
    .notEmpty()
    .withMessage('Academic session is required')
    .isString()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic session must be valid (e.g., 2026-27)'),
  body('admissionFee')
    .notEmpty()
    .withMessage('Admission fee is required')
    .isFloat({ min: 0 })
    .withMessage('Admission fee cannot be negative'),
  body('monthlyTuitionFee')
    .notEmpty()
    .withMessage('Monthly tuition fee is required')
    .isFloat({ min: 0 })
    .withMessage('Monthly tuition fee cannot be negative'),
  body('annualCharges')
    .notEmpty()
    .withMessage('Annual charges are required')
    .isFloat({ min: 0 })
    .withMessage('Annual charges cannot be negative'),
  body('otherCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other charges cannot be negative'),
  body('busFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bus fee cannot be negative'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

export const updateFeeStructureRules = [
  body('classGrade')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Class name must be between 1 and 50 characters'),
  body('academicSession')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Academic session must be valid (e.g., 2026-27)'),
  body('admissionFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Admission fee cannot be negative'),
  body('monthlyTuitionFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly tuition fee cannot be negative'),
  body('annualCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual charges cannot be negative'),
  body('otherCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other charges cannot be negative'),
  body('busFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Bus fee cannot be negative'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];
