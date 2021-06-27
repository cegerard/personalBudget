import { MongoExpenseRepository } from '../../../db/mongo';
import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import ExpenseModelStub from '../../../test/stubs/ExpenseModelStub';
import RemoveBudget from './RemoveBudget';

describe('BudgetService', () => {
  const SECOND_BUDGET_ID = '2';

  let useCase: RemoveBudget;
  let budgetRepository: BudgetRepositoryStub;

  beforeAll(() => {
    budgetRepository = new BudgetRepositoryStub();
    const expenseRepository = new MongoExpenseRepository(ExpenseModelStub);
    useCase = new RemoveBudget(budgetRepository, expenseRepository);
  });

  beforeEach(() => {
    budgetRepository.resetStore();
    ExpenseModelStub.resetStore();
  });

  describe('remove', () => {
    it('should remove an existing budget', async () => {
      const isDeleted = await useCase.remove(SECOND_BUDGET_ID);

      expect(isDeleted).toEqual(true);
    });

    it('should do nothing for a non existing budget', async () => {
      const isDeleted = await useCase.remove('unkown');

      expect(isDeleted).toEqual(false);
    });
  });
});
