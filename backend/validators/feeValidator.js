import { body } from 'express-validator';

export const createFeeRules = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .isMongoId()
    .withMessage('Invalid student ID'),
  body('feeType')
    .notEmpty()
    .withMessage('Fee type is required')
    .isIn(['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Activity Fee', 'Transport Fee', 'Miscellaneous'])
    .withMessage('Invalid fee type'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
];

export const recordPaymentRules = [
  body('paidAmount')
    .notEmpty()
    .withMessage('Paid amount is required')
    .isFloat({ min: 1 })
    .withMessage('Paid amount must be greater than zero'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'])
    .withMessage('Payment method must be Cash, UPI, Bank Transfer, Cheque, or Online'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Transaction ID cannot exceed 100 characters'),
];
