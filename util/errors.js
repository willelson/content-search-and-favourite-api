function CustomRequestError(message, status) {
  this.status = status;
  this.message = message;
}

class BadRequestError extends CustomRequestError {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

class NotFoundError extends CustomRequestError {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

exports.CustomRequestError = CustomRequestError;
exports.BadRequestError = BadRequestError;
exports.NotFoundError = NotFoundError;
