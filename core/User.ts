export class User {
  private readonly _id: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _login: string;
  private readonly _password: string;

  constructor(id: string, firstName: string, lastName: string, login: string, password: string) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._login = login;
    this._password = password;
  }

  public get id(): string {
    return this._id;
  }

  public get login(): string {
    return this._login;
  }

  public get fullName(): string {
    return [this._firstName, this._lastName].join(' ').trim();
  }

  public get encryptedPassword(): string {
    return this._password;
  }
}
