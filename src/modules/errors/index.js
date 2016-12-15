export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UniqueConstraintError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}
