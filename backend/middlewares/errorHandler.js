const AppError = require('../utils/appError');
// const isProd = process.env.NODE_ENV === 'production';

const mapKnownError = (err) => {
    if (err.name === 'CastError') {
        return {
            statusCode: 400,
            code: 'INVALID_ID',
            message: `Invalid ${err.path}.`
        };
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map(e => ({
            field: e.path,
            message: e.message
        }));

        return {
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors
        };
    }

    if (err.code === 11000) {
        const field =
            Object.keys(err.keyPattern || err.keyValue || {})[0] ||
            'field';

        return {
            statusCode: 409,
            code: 'CONFLICT',
            message: `A record with this ${field} already exists`
        };
    }

    if (
        err.type === 'entity.parse.failed' ||
        (err instanceof SyntaxError && 'body' in err)
    ) {
        return {
            statusCode: 400,
            code: 'INVALID_JSON',
            message: 'Malformed JSON in request body'
        };
    }

    if (err.type === 'entity.too.large' || err.status === 413) {
        return {
            statusCode: 413,
            code: 'PAYLOAD_TOO_LARGE',
            message: 'Request payload is too large'
        };
    }

    if (err.name === 'MulterError') {
        return {
            statusCode: 400,
            code: 'FILE_UPLOAD_ERROR',
            message: err.message || 'File upload failed'
        };
    }

    if (
        err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError'
    ) {
        return {
            statusCode: 401,
            code: 'SESSION_EXPIRED',
            message: 'Your session has expired'
        };
    }

    if (err.message === 'Not allowed by CORS') {
        return {
            statusCode: 403,
            code: 'CORS_FORBIDDEN',
            message: 'Origin not permitted'
        };
    }

    return null;
};

module.exports = (err, req, res, next) => {
    const mapped = err.isOperational
        ? {
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            data: err.data,
            errors: err.details
        }
        : mapKnownError(err);

    const statusCode = mapped?.statusCode || 500;

    const body = {
        status: 'error',
        code: mapped?.code || 'INTERNAL_ERROR',
        message:
            mapped?.message ||
            'Something went wrong. Please try again',
        data: mapped?.data ?? null,
        errors: mapped?.errors ?? null,
        requestId: req.id || null
    };

    console.error(
        `[Error] ${req.method} ${req.originalUrl} -> ${statusCode}`,
        err
    );

    return res.status(statusCode).json(body);
};