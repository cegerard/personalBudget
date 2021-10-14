import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../test/stubs/ExpenseRepositoryStub';
import RemoveBudget from './RemoveBudget';

describe('BudgetService', () => {
  const SECOND_BUDGET_ID = '2';

  let useCase: RemoveBudget;
  let budgetRepository: BudgetRepositoryStub;
  let expenseRepository: ExpenseRepositoryStub;

  beforeAll(() => {
    budgetRepository = new BudgetRepositoryStub();
    expenseRepository = new ExpenseRepositoryStub();
    useCase = new RemoveBudget(budgetRepository, expenseRepository);
  });

  beforeEach(() => {
    budgetRepository.resetStore();
    expenseRepository.resetStore();
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
