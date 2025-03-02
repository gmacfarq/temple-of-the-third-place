class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message || 'Validation Error', 400);
    this.errors = errors;
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || 'Unauthorized', 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message || 'Forbidden', 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource Not Found', 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || 'Resource Conflict', 409);
  }
}

class InternalServerError extends AppError {
  constructor(message) {
    super(message || 'Internal Server Error', 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError
};