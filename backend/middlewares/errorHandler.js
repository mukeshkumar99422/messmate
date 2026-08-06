const isProd = process.env.NODE_ENV === 'production';

/**
 * Maps a subset of KNOWN, expected error types to a safe status + message.
 */
const mapKnownError = (err) => {
  // ---- Mongoose: invalid ObjectId in a query (e.g. /hostels/:id with a malformed id, or a bad ref lookup) ----
  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid ${err.path}: ${err.value}` };
  }

  // ---- Mongoose: schema validation failed on .save()/.create() ----
  if (err.name === 'ValidationError') {
    const firstField = Object.values(err.errors || {})[0];
    return {
      statusCode: 400,
      message: firstField?.message || 'Validation failed',
    };
  }

  // ---- Mongoose: unique index violation (Hostel.name, User.identifier, WeeklyMenu.hostel, Item{hostel,name,type}, etc.) ----
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    return { statusCode: 409, message: `A record with this ${field} already exists.` };
  }

  // ---- body-parser: malformed JSON in request body ----
  // express.json() throws a SyntaxError with `status`/`statusCode` 400
  // and `type === 'entity.parse.failed'`.
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    return { statusCode: 400, message: 'Malformed JSON in request body.' };
  }

  // ---- body-parser: request body larger than express.json() limit ----
  if (err.type === 'entity.too.large' || err.status === 413) {
    return { statusCode: 413, message: 'Request payload too large.' };
  }

  // ---- multer: fallback in case a future upload route forgets its own
  // inline multer error handling (accountantRoutes.js currently handles
  // this itself, but this keeps the API consistent if that ever changes) ----
  if (err.name === 'MulterError') {
    return { statusCode: 400, message: err.message || 'File upload error.' };
  }

  // ---- jsonwebtoken: fallback for any route that calls jwt.verify()
  // outside the existing try/catch in authController/authMiddleware ----
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Invalid or expired session.' };
  }

  // ---- cors: origin not on the allow-list ----
  if (err.message === 'Not allowed by CORS') {
    return { statusCode: 403, message: 'Origin not permitted.' };
  }

  // ---- csrf-csrf: invalid or missing CSRF token ----
  if (err.code === 'EBADCSRFTOKEN') {
    return { statusCode: 403, message: 'Invalid or missing CSRF token. Please refresh and try again.' };
  }

  return null;
};

/**
 * Central error handler.
 */
module.exports = (err, req, res, next) => {
  const known = err.isOperational
    ? { statusCode: err.statusCode || 400, message: err.message }
    : mapKnownError(err);

  const statusCode = known?.statusCode || err.statusCode || 500;
  const clientMessage = known?.message || 'Something went wrong. Please try again.';

  console.error(
    `[Error] ${req.method} ${req.originalUrl} -> ${statusCode} | ` +
      `user=${req.user?._id || 'anon'} | ${err.name || 'Error'}: ${err.message}`
  );

  //log error in non production environment
  if (!isProd) {
    console.error(err.stack);
  }

  const body = { message: clientMessage };
  if (known?.code) body.code = known.code;
  if (err.details) body.errors = err.details;

  res.status(statusCode).json(body);
};