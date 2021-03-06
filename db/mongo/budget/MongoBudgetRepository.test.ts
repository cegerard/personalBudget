jest.mock('.');
import budgetModel from '.';
import { attributesToPatch, writeBudget, writeBudgetComplete } from '../../../core/@types/budget/types';
import MongoBudgetRepository from './MongoBudgetRespository';

const save = jest.fn();
const constructor = () => {
  return { save };
};

(budgetModel as any).mockImplementation(constructor);

describe('MongoBudgetRepository', () => {
  let mongoRepository: MongoBudgetRepository;

  beforeEach(() => {
    mongoRepository = new MongoBudgetRepository();
  });

  describe('find', () => {
    it('should retreive budgets with all field', async () => {
      await mongoRepository.find([]);
      expect(budgetModel.find).toHaveBeenCalledWith({}, []);
    });

    it('should retreive budgets with default parameter', async () => {
      await mongoRepository.find();
      expect(budgetModel.find).toHaveBeenCalledWith({}, []);
    });
  });

  describe('findOneById', () => {
    it('should retreive one budgets from its id with all field', async () => {
      await mongoRepository.findOneById('123');
      expect(budgetModel.findById).toHaveBeenCalledWith('123', []);
    });

    it('should retreive one budgets from its id with selected field', async () => {
      await mongoRepository.findOneById('123', ['id', 'name']);
      expect(budgetModel.findById).toHaveBeenCalledWith('123', ['id', 'name']);
    });
  });

  describe('create', () => {
    const minimalBudget: writeBudget = {
      name: 'test',
      slug: 'test',
      amount: 42,
      type: 'NORMAL',
      description: 'blabla',
    };

    it('should create a new budget', async () => {
      await mongoRepository.create(minimalBudget);
      expect(save).toHaveBeenCalled();
    });

    it('should return void', async () => {
      const ret = await mongoRepository.create(minimalBudget);
      expect(ret).toBeUndefined();
    });
  });

  describe('update', () => {
    const budget: writeBudgetComplete = {
      _id: '123',
      name: 'test',
      slug: 'test',
      amount: 42,
      available: 42,
      description: 'description',
      type: 'NORMAL',
    };

    describe('when only one budget is updated', () => {
      beforeEach(() => {
        budgetModel.replaceOne = jest.fn(() => {
          return { nModified: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.update(budget);
        expect(res).toEqual(true);
      });
    });

    describe('when no budget is updated', () => {
      beforeEach(() => {
        budgetModel.replaceOne = jest.fn(() => {
          return { nModified: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.update(budget);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple budget are updated', () => {
      beforeEach(() => {
        budgetModel.replaceOne = jest.fn(() => {
          return { nModified: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.update(budget);
        expect(res).toEqual(false);
      });
    });
  });

  describe('patch', () => {
    const budgetId = '123';
    const attributes: attributesToPatch = {
      name: 'test',
      amount: 42,
    };

    describe('when only one budget is updated', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.patch(budgetId, attributes);
        expect(res).toEqual(true);
      });
    });

    describe('when no budget is updated', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.patch(budgetId, attributes);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple budget are updated', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.patch(budgetId, attributes);
        expect(res).toEqual(false);
      });
    });
  });

  describe('delete', () => {
    const budgetId = '123';

    describe('when only one budget is deleted', () => {
      beforeEach(() => {
        budgetModel.remove = jest.fn(() => {
          return { deletedCount: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.delete(budgetId);
        expect(res).toEqual(true);
      });
    });

    describe('when no budget is removed', () => {
      beforeEach(() => {
        budgetModel.remove = jest.fn(() => {
          return { nModified: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.delete(budgetId);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple budget are removed', () => {
      beforeEach(() => {
        budgetModel.remove = jest.fn(() => {
          return { nModified: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.delete(budgetId);
        expect(res).toEqual(false);
      });
    });
  });
});
