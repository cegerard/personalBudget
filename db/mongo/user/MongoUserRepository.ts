import userModel from '.';
import { userCreate } from '../../../core/@types/user/types';
import UserRepository from '../../../core/interfaces/user/UserRepository';
import { User } from '../../../core/User';

export default class MongoUserRepository implements UserRepository {
  async find(id: string): Promise<User | undefined> {
    const userDocument = await userModel.findById(id);
    if (userDocument) {
      return new User(
        userDocument._id,
        userDocument.firstName,
        userDocument.lastName,
        userDocument.email,
        userDocument.password
      );
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const userDocument = await userModel.findOne({ email });
    if (userDocument) {
      return new User(
        userDocument._id,
        userDocument.firstName,
        userDocument.lastName,
        userDocument.email,
        userDocument.password
      );
    }
  }

  async create(user: userCreate): Promise<User> {
    const createdUser: any = await userModel.create(user);
    return new User(
      createdUser._id,
      createdUser.firstName,
      createdUser.lastName,
      createdUser.email,
      createdUser.password
    );
  }
}
