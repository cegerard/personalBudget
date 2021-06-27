import BudgetRepositoryStub from '../../../../test/stubs/BudgetRepositoryStub';
import RemoveExpense from './RemoveExpense';

describe('RemoveExpense', () => {
  const FOURTH_BUDGET_ID = '4';
  const budgetRepository = new BudgetRepositoryStub();

  beforeEach(() => {
    budgetRepository.resetStore();
  });

  describe('remove', () => {
    const expenseId = '100';

    let useCase: RemoveExpense;

    beforeEach(() => {
      useCase = new RemoveExpense(FOURTH_BUDGET_ID, budgetRepository);
    });

    it('should return that the expense has been removed', async () => {
      const isRemoved = await useCase.remove(expenseId);
      expect(isRemoved).toEqual(true);
    });

    it('should remove the expense from the expenses array', async () => {
      await useCase.remove(expenseId);
      const updatedBudget = await budgetRepository.findOneById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(1);
      expect(updatedBudget.expenses[0]._id).toEqual('101');
    });

    it('should update the available field', async () => {
      await useCase.remove(expenseId);
      const updatedBudget = await budgetRepository.findOneById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(120);
    });
  });
});
