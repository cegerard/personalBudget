jest.mock('.');
import { userCreate } from '../../../core/@types/user/types';
import { User } from '../../../core/User';
import userModel from '.';
import MongoUserRepository from './MongoUserRepository';


const save = jest.fn();
const constructor = () => {
  return { save };
};

(userModel as any).mockImplementation(constructor);

describe('MongoUserRepository', () => {
  let mongoRepository: MongoUserRepository;

  beforeEach(() => {
    mongoRepository = new MongoUserRepository();
  });

  describe('find', () => {
    describe('when the user does not exists', () => {
      it('should return undefined', async () => {
        const user = await mongoRepository.find('123');
        expect(user).toBeUndefined();
      });
    });

    describe('when the user exists', () => {
      beforeEach(() => {
        (userModel.findById as any).mockResolvedValue({
          _id: '123',
          firstName: 'test',
          lastName: 'test',
          email: 'test@d2velop.fr',
          password: 'USB$68787=',
        });  
      });

      it('should return the user', async () => {  
        const user = await mongoRepository.find('123');
        expect(user).toBeDefined();
      });
    });

  });

  describe('findByEmail', () => {
    const adminEmail = 'admin@d2velop.fr';

    describe('when the user does not exists', () => {
      it('should return undefined', async () => {
        const user = await mongoRepository.findByEmail(adminEmail);
        expect(user).toBeUndefined();
      });
    });

    describe('when the user exists', () => {
      beforeEach(() => {
        (userModel.findOne as any).mockResolvedValue({
          _id: '123',
          firstName: 'test',
          lastName: 'test',
          email: 'test@d2velop.fr',
          password: 'USB$68787=',
        });  
      });

      it('should return the user', async () => {
        const user = await mongoRepository.findByEmail(adminEmail);
        expect(user).toBeDefined();
      });
    });
  });

  describe('create', () => {
    const userId = '123';
    const user: userCreate = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@d2velop.fr',
      password: 'pass',
    };

    (userModel.create as any).mockResolvedValue({
      _id: userId,
      firstName: 'test',
      lastName: 'test',
      email: 'test@d2velop.fr',
      password: 'USB$68787=',
    });

    it('should create a new user', async () => {
      await mongoRepository.create(user);

      expect(userModel.create).toHaveBeenCalledWith(user);
    });

    it('should return the newly created user', async () => {
      const createdUser = await mongoRepository.create(user);

      expect(createdUser instanceof User).toBe(true);
    });

    it('should return the uer with an id', async () => {
      const createdUser = await mongoRepository.create(user);

      expect(createdUser.id).toEqual(userId);
    });
  });
});
