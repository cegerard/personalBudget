import { userCreate } from '../../@types/user/types';
import { User } from '../../User';

export default interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  find(id: string): Promise<User | undefined>;
  create(user: userCreate): Promise<User>;
}
