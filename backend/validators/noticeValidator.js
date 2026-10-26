import { body } from 'express-validator';

export const createNoticeRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notice title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .optional()
    .custom((val, { req }) => {
      const hasContent = typeof val === 'string' && val.trim().length > 0;
      const hasSummary = typeof req.body?.summary === 'string' && req.body.summary.trim().length > 0;
      if (!hasContent && !hasSummary) {
        throw new Error('Notice content or summary is required');
      }
      return true;
    }),
  body('category')
    .optional()
    .custom((val) => {
      const allowed = ['academic', 'academics', 'admissions', 'holidays', 'examinations', 'general', 'urgent'];
      if (!allowed.includes(String(val).toLowerCase().trim())) {
        throw new Error('Invalid notice category');
      }
      return true;
    }),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean value'),
  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('pinned must be a boolean value'),
];
