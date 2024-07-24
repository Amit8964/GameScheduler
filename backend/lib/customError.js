class CustomError extends Error {
  constructor(message, statusCode, priority) {
    super(message);
    this.statusCode = statusCode;
    this.priority = priority ? priority : "LOW";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
