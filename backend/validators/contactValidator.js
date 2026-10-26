import { body } from 'express-validator';

export const contactMessageRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required')
    .custom((val) => {
      const digits = val.replace(/\D/g, '');
      if (digits.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      return true;
    }),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Subject cannot exceed 150 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Message must be between 5 and 2000 characters'),
];
