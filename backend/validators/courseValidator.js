import { body } from 'express-validator';

export const createCourseRules = [
  body('classGrade')
    .notEmpty()
    .withMessage('Class / Grade is required')
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
  body('timing')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Timing cannot exceed 120 characters'),
  body('medium')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Medium cannot exceed 120 characters'),
  body('weeklyLoad')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Weekly load cannot exceed 120 characters'),
  body('stage')
    .optional()
    .isString()
    .trim(),
  body('age')
    .optional()
    .isString()
    .trim(),
  body('overview')
    .optional()
    .isString()
    .trim(),
  body('curriculumPoints')
    .optional()
    .isArray()
    .withMessage('curriculumPoints must be an array of strings'),
  body('subjectList')
    .optional()
    .isArray()
    .withMessage('subjectList must be an array of subject items'),
  body('outcomes')
    .optional()
    .isArray()
    .withMessage('outcomes must be an array of strings'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

export const updateCourseRules = [
  body('classGrade')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 }),
  body('academicSession')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 4, max: 20 }),
  body('timing')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 }),
  body('medium')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 }),
  body('weeklyLoad')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 120 }),
  body('stage')
    .optional()
    .isString()
    .trim(),
  body('age')
    .optional()
    .isString()
    .trim(),
  body('overview')
    .optional()
    .isString()
    .trim(),
  body('curriculumPoints')
    .optional()
    .isArray(),
  body('subjectList')
    .optional()
    .isArray(),
  body('outcomes')
    .optional()
    .isArray(),
  body('isPublished')
    .optional()
    .isBoolean(),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }),
];
