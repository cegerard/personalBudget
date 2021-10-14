import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

import { User } from './User';
import Authentication from '../lib/security/authentication';

export class UserCredential {
  private readonly login: string;
  private readonly password: string;

  constructor(login: string, password: string) {
    this.login = login;
    this.password = password;
  }

  static cipher(data: string): string {
    return AES.encrypt(data, Authentication.PASSPHRASE).toString();
  }

  public authenticate(user: User | undefined) {
    if (!user) return false;

    const decryptedPassword = AES.decrypt(user.encryptedPassword, Authentication.PASSPHRASE);
    return this.login === user.login && this.password === decryptedPassword.toString(Utf8);
  }
}
