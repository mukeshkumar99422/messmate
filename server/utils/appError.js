/**
 * Structured operational error for intentional, expected failures
 *
 * Usage in a controller:
 *   const AppError = require('../utils/AppError');
 *   if (!hostel) return next(new AppError('Hostel not found', 404));
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
 
module.exports = AppError;