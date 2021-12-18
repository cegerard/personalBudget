jest.mock('.');
import budgetModel from '.';
import {
  attributesToPatch,
  writeBudget,
  writeBudgetComplete,
} from '../../../core/@types/budget/types';
import MongoAdminBudgetRepository from './MongoAdminBudgetRespository';

const save = jest.fn();
const constructor = () => {
  return { save };
};

(budgetModel as any).mockImplementation(constructor);

describe('MongoAdminBudgetRepository', () => {
  let mongoRepository: MongoAdminBudgetRepository;
  let userId = '123';

  beforeEach(() => {
    mongoRepository = new MongoAdminBudgetRepository();
  });

  afterEach(() => {
    (budgetModel as any).mockClear();
  });

  describe('findAll', () => {
    it('should retreive all budgets with all field', async () => {
      await mongoRepository.findAll([]);
      expect(budgetModel.find).toHaveBeenCalledWith({}, []);
    });

    it('should retreive budgets with selected fields', async () => {
      await mongoRepository.findAll();
      expect(budgetModel.find).toHaveBeenCalledWith({}, []);
    });

    it('should retreive budgets with default parameter', async () => {
      await mongoRepository.findAll(['id', 'name']);
      expect(budgetModel.find).toHaveBeenCalledWith({}, ['id', 'name']);
    });
  });

  describe('renew', () => {
    const budgetId = '123';

    describe('when only one budget is renewed', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 1 };
        });
      });

      it('returns true', async () => {
        const res = await mongoRepository.renew(budgetId, 42, []);
        expect(res).toEqual(true);
      });
    });

    describe('when no budget is renewed', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 0 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.renew(budgetId, 42, []);
        expect(res).toEqual(false);
      });
    });

    describe('when multiple budget are renewed', () => {
      beforeEach(() => {
        budgetModel.updateOne = jest.fn(() => {
          return { n: 3 };
        });
      });

      it('returns false', async () => {
        const res = await mongoRepository.renew(budgetId, 42, []);
        expect(res).toEqual(false);
      });
    });
  });
});
