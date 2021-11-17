import BudgetRepositoryStub from '../../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../../test/stubs/ExpenseRepositoryStub';
import UpdateExpense from './UpdateExpense';

describe('UpdateExpense', () => {
  const FOURTH_BUDGET_ID = '4';
  const USER_ID = '0001';
  const budgetRepository = new BudgetRepositoryStub();
  const expenseRepository = new ExpenseRepositoryStub();

  let useCase: UpdateExpense;

  beforeEach(() => {
    budgetRepository.resetStore();
    expenseRepository.resetStore();
  });

  describe('updateExpense', () => {
    describe('when the expense can be found in the budget line', () => {
      const EXPENSE_ID = '100';
      const EXPECTED_EXPENSE = {
        _id: EXPENSE_ID,
        name: 'new expense name',
        amount: 100000,
        date: '2021-01-01',
      };

      beforeEach(async () => {
        await expenseRepository.patch(EXPENSE_ID, {
          name: EXPECTED_EXPENSE.name,
          amount: EXPECTED_EXPENSE.amount,
          date: EXPECTED_EXPENSE.date,
        });

        useCase = new UpdateExpense(EXPENSE_ID, USER_ID, budgetRepository, expenseRepository);
      });

      it('should return that the expense has been updated', async () => {
        const isUpdated = await useCase.update();
        expect(isUpdated).toEqual(true);
      });

      it('should update the expense in its budget line', async () => {
        await useCase.update();
        const updatedBudget = await budgetRepository.getById(FOURTH_BUDGET_ID);
        expect(updatedBudget.expenses[0]).toEqual(EXPECTED_EXPENSE);
      });
    });

    describe('when the expense does not exist', () => {
      const UNKNOWN_EXPENSE_ID = 'unknown';

      beforeEach(async () => {
        useCase = new UpdateExpense(UNKNOWN_EXPENSE_ID, USER_ID,budgetRepository, expenseRepository);
      });

      it('should return false', async () => {
        const isUpdated = await useCase.update();
        expect(isUpdated).toEqual(false);
      });
    });

    describe('when the expense is not found from its budget line', () => {
      const MISSING_EXPENSE_ID = '200';

      beforeEach(async () => {
        useCase = new UpdateExpense(MISSING_EXPENSE_ID, USER_ID, budgetRepository, expenseRepository);
      });

      it('should return false', async () => {
        const isUpdated = await useCase.update();
        expect(isUpdated).toEqual(false);
      });
    });
  });
});
