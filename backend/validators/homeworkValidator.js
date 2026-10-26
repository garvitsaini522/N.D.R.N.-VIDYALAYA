import { body } from 'express-validator';

export const createHomeworkRules = [
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Homework title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description/Instructions are required'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];
