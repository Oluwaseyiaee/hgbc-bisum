class customError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = (this.statusCode >= 400 && this.statusCode < 600) ? "fail" : "success";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = customError;
