export default class AppError extends Error {
  public status: any;

  constructor(errorCode: any, message: string) {
    super(message);
    this.status = errorCode;
  }
}
