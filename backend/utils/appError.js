/**
 * Error wrapper
 */
class AppError extends Error {
    /**
   * @param {string} message neccessary
   * @param {string} statusCode optional
   * @param {[400,401,402,403...]} code optional
   * @param {object} data optional
   * @param {object} details optional
   */
    constructor(message, statusCode = 400, code = 'BAD_REQUEST', data = null, details = null) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.data = data;
        this.details = details;
        this.isOperational = true;
    }
}

module.exports = AppError;