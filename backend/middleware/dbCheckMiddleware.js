import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Middleware that ensures MongoDB connection is active before attempting database queries.
 * Prevents requests from buffering/hanging when database is unreachable.
 */
export function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return ApiResponse.error(
      res,
      'Database connection is currently unavailable. Please ensure MongoDB is running and MONGODB_URI is correctly configured.',
      503
    );
  }
  next();
}
