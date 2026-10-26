import { body } from 'express-validator';

export const markAttendanceRules = [
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be an array with at least one student attendance record'),
  body('records.*.studentId')
    .notEmpty()
    .withMessage('studentId is required for each record')
    .isMongoId()
    .withMessage('Invalid student ID in record'),
  body('records.*.status')
    .notEmpty()
    .withMessage('Status is required for each record')
    .isIn(['present', 'absent', 'late', 'half_day', 'holiday'])
    .withMessage('Status must be present, absent, late, half_day, or holiday'),
];
