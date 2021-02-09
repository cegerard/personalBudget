module.exports = class AppError extends Error {
  constructor(errorCode, message) {
    super(message);
    this.status = errorCode;
  }
};
