jest.mock('.');
import expenseModel from '.';
import { deleteQuery, expenseQuery, patchableAttributes, writeExpense } from '../../../core/@types/expense/types';
import MongoExpenseRepository from './MongoExpenseRepository';

const save = jest.fn(() => { 
  return Promise.resolve({ _id: '123' });
});
const constructor = () => {
  return { save };
};

(expenseModel as any).mockImplementation(constructor);

describe('MongoExpenseRepository', () => {
  let mongoRepository: MongoExpenseRepository;

  beforeEach(() => {
    mongoRepository = new MongoExpenseRepository();
  });

  describe('find', () => {
    const query: expenseQuery = { _id: '123'};

    it('should retreive expenses with the query', async () => {
      await mongoRepository.find(query);
      expect(expenseModel.find).toHaveBeenCalledWith(query);
    });

    it('should retreive all expenses', async () => {
      await mongoRepository.find();
      expect(expenseModel.find).toHaveBeenCalledWith(undefined);
    });
  });

  describe('create', () => {
    const expenseValue: writeExpense = {
      name: 'test',
      amount: 42,
      date: '2021/02/23',
      budgetLine: {
        _id: '123',
        name: 'expense',
      },
    };

    it('should create a new expense', async () => {
      await mongoRepository.create(expenseValue);
      expect(save).toHaveBeenCalled();
    });

    it('should return the expense id', async () => {
      const ret = await mongoRepository.create(expenseValue);
      expect(ret).toEqual({_id: '123'});
    });
  });

  describe('patch', () => {
    const expenseId = '123';
    const attributes: patchableAttributes = {
      name: 'test',
      amount: 42,
    };

    describe('when only one expense is updated', () => {
      beforeEach(() => {
        expenseModel.updateOne = jest.fn(() => {
          return { n: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.patch(expenseId, attributes);
        expect(res).toEqual(true);
      });
    });

    describe('when no expense is updated', () => {
      beforeEach(() => {
        expenseModel.updateOne = jest.fn(() => {
          return { n: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.patch(expenseId, attributes);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple expense are updated', () => {
      beforeEach(() => {
        expenseModel.updateOne = jest.fn(() => {
          return { n: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.patch(expenseId, attributes);
        expect(res).toEqual(false);
      });
    });
  });

  describe('delete', () => {
    const query: deleteQuery = {
      "budgetLine._id": '123'
    }

    describe('when only one expense is deleted', () => {
      beforeEach(() => {
        expenseModel.remove = jest.fn(() => {
          return { deletedCount: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.delete(query);
        expect(res).toEqual(true);
      });
    });

    describe('when no expense is removed', () => {
      beforeEach(() => {
        expenseModel.remove = jest.fn(() => {
          return { nModified: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.delete(query);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple expense are removed', () => {
      beforeEach(() => {
        expenseModel.remove = jest.fn(() => {
          return { nModified: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.delete(query);
        expect(res).toEqual(false);
      });
    });
  });
});
