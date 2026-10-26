import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Middleware to check express-validator validation results
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return ApiResponse.error(res, 'Validation failed. Please correct the invalid fields.', 400, formattedErrors);
  }
  next();
}
