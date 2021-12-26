import MongoBalanceRepository from './MongoBalanceRepository';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('MongoBalanceRepository', () => {
  let mongo: MongoMemoryServer;
  let mongoRepository: MongoBalanceRepository;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    mongoRepository = new MongoBalanceRepository();
  });

  afterEach(async () => {
    await mongoose.connection.db.collection('balances').deleteMany({});
  });

  describe('setAmount', () => {
    const USER_ID = '0001';
    const AMOUNT = 2434;

    describe('when no balance exits for the user', () => {
      it('returns true', () => {
        expect(mongoRepository.setAmount(USER_ID, AMOUNT)).resolves.toEqual(true);
      });

      it('creates a new balance', async () => {
        await mongoRepository.setAmount(USER_ID, AMOUNT);

        const balance = await mongoose.connection.db
          .collection('balances')
          .findOne({ userId: USER_ID });
        expect(balance.amount).toEqual(AMOUNT);
      });
    });

    describe('when balance exits for the user', () => {
      const NEW_AMOUNT = 442;

      beforeEach(async () => {
        await mongoose.connection.db
          .collection('balances')
          .insertOne({ userId: USER_ID, amount: AMOUNT });
      });

      it('returns true', () => {
        expect(mongoRepository.setAmount(USER_ID, NEW_AMOUNT)).resolves.toEqual(true);
      });

      it('update the existing balance', async () => {
        await mongoRepository.setAmount(USER_ID, NEW_AMOUNT);

        const balance = await mongoose.connection.db
          .collection('balances')
          .findOne({ amount: 442 });
        expect(balance.amount).toEqual(NEW_AMOUNT);
      });
    });
  });

  describe('getBalance', () => {
    const USER_ID = '0001';
    const AMOUNT = 2434;

    describe('Whe the balance exists', () => {
      beforeEach(async () => {
        await mongoose.connection.db
          .collection('balances')
          .insertOne({ userId: USER_ID, amount: AMOUNT });
      });

      it('returns the balance', async () => {
        const balance = await mongoRepository.getBalance(USER_ID);

        expect(balance).toEqual({ amount: AMOUNT, userId: USER_ID });
      });
    });

    describe('When the balance does not exists', () => {
      it('returns the balance', async () => {
        const balance = await mongoRepository.getBalance(USER_ID);

        expect(balance).toBeUndefined();
      });
    });
  });
});
