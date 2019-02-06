class AppError extends Error {
  constructor(message, body) {
    super();
    this.message = message;
    this.name = this.constructor.name;
    this.body = body === undefined ? null : body;

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class ValidationError extends AppError {
  constructor(message, body) {
    super(message, body);
    this.name = "ValidationError";
  }
}

export class RecordNotFoundException extends AppError {
  constructor(message, body) {
    super(message, body);
    this.name = "RecordNotFoundException";
  }
}

export class PermisstionDeniedException extends AppError {
  constructor(message, body) {
    super(message, body);
    this.name = "PermisstionDeniedException";
  }
}
