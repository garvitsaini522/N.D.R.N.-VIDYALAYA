import mongoose from 'mongoose';
import { body, param } from 'express-validator';

const VALID_ADMISSION_STATUSES = [
  'Received',
  'Pending',
  'Contacted',
  'Under Review',
  'Verified',
  'Admitted',
  'Rejected',
  'Cancelled',
  'new',
  'contacted',
  'documents_pending',
  'under_review',
  'verified',
  'admitted',
  'rejected',
  'cancelled',
];

export const admissionEnquiryRules = [
  body('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('parentName')
    .trim()
    .notEmpty()
    .withMessage('Parent or guardian name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Parent name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Mobile contact number is required')
    .custom((val) => {
      const digits = String(val || '').replace(/\D/g, '');
      if (digits.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      return true;
    }),
  body('gradeApplying')
    .trim()
    .notEmpty()
    .withMessage('Grade applying for is required')
    .isIn(['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'])
    .withMessage('Grade must be between Nursery and Class 5'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
];

export const updateAdmissionStatusRules = [
  param('id')
    .custom((val) => {
      if (mongoose.Types.ObjectId.isValid(val) || /^ADM-\d{4}-\d+$/i.test(val)) {
        return true;
      }
      throw new Error('Invalid admission enquiry ID format');
    }),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .custom((val) => {
      if (!VALID_ADMISSION_STATUSES.includes(val)) {
        throw new Error('Invalid admission status');
      }
      return true;
    }),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];
