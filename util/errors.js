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

const globalErrorHandler = (err, req, res, next) => {
  if (err instanceof CustomRequestError) {
    res.status(err.status).send(err.message);
    return;
  } else {
    console.log(err.message);
    res.status(500).send();
    return;
  }
};

exports.BadRequestError = BadRequestError;
exports.NotFoundError = NotFoundError;
exports.globalErrorHandler = globalErrorHandler;
