import AES from 'crypto-js/aes';
import uid from 'uid';

import { userCreate } from '../../core/@types/user/types';
import UserRepository from '../../core/interfaces/user/UserRepository';
import { User } from '../../core/User';
import Authentication from '../../lib/security/authentication';

export default class UserRepositoryStub implements UserRepository {
  private userStore: User[];

  constructor() {
    this.userStore = [];
    this.resetStore();
  }

  public find(id: string): Promise<User | undefined> {
    const foundUser = this.userStore.find((user) => user.id === id);
    return Promise.resolve(foundUser);
  }

  public findByEmail(email: string): Promise<User | undefined> {
    const foundUser = this.userStore.find((user) => user.login === email);
    return Promise.resolve(foundUser);
  }

  create(user: userCreate): Promise<User> {
    const newUser = new User(uid(), user.firstName, user.lastName, user.email, user.password);

    this.userStore.push(newUser);

    return Promise.resolve(newUser);
  }

  public resetStore() {
    const encryptedPassword = AES.encrypt('pass', Authentication.PASSPHRASE).toString();
    const defaultUser = new User(
      '0001',
      'admin',
      'istrator',
      'admin@d2velop.fr',
      encryptedPassword
    );
    this.userStore = [defaultUser];
  }
}
