import { body } from 'express-validator';

export const loginRules = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body()
    .custom((val) => {
      const id = val.identifier || val.email;
      if (!id || (typeof id === 'string' && id.trim().length === 0)) {
        throw new Error('Email or login identifier is required');
      }
      return true;
    }),
];

export const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'teacher', 'student', 'parent', 'staff'])
    .withMessage('Role must be admin, teacher, student, parent, or staff'),
  body('phone')
    .optional()
    .matches(/^[0-9+ -]{10,15}$/)
    .withMessage('Please enter a valid phone number (10-15 digits)'),
];
