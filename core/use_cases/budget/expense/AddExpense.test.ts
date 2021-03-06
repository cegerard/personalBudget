import BudgetRepositoryStub from '../../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../../test/stubs/ExpenseRepositoryStub';
import AddExpense from './AddExpense';

describe('BudgetService', () => {
  const THIRD_BUDGET_ID = '3';
  const FOURTH_BUDGET_ID = '4';

  let budgetRepository: BudgetRepositoryStub;
  let expenseRepository: ExpenseRepositoryStub;

  beforeAll(() => {
    budgetRepository = new BudgetRepositoryStub();
    expenseRepository = new ExpenseRepositoryStub();
  });

  beforeEach(() => {
    budgetRepository.resetStore();
    expenseRepository.resetStore();
  });

  describe('add', () => {
    const newExpense = {
      _id: '42',
      name: 'new expense',
      amount: 42,
      date: '2020-12-29',
    };

    it('should return that the expense has been added', async () => {
      const isReplaced = await new AddExpense(FOURTH_BUDGET_ID, budgetRepository).add(newExpense);
      expect(isReplaced).toEqual(true);
    });

    it('should add a the expense to the budget expense array', async () => {
      await new AddExpense(FOURTH_BUDGET_ID, budgetRepository).add(newExpense);
      const updatedBudget = await budgetRepository.findOneById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(3);
      expect(updatedBudget.expenses[2]).toEqual(newExpense);
    });

    it('should update the budget available field', async () => {
      await new AddExpense(FOURTH_BUDGET_ID, budgetRepository).add(newExpense);
      const updatedBudget = await budgetRepository.findOneById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(37);
    });

    it('should update the budget available field with correct parsing', async () => {
      await new AddExpense(THIRD_BUDGET_ID, budgetRepository).add({
        _id: '42',
        name: 'new expense',
        amount: -1.19,
        date: '2020-12-29',
      });
      const updatedBudget = await budgetRepository.findOneById(THIRD_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(858.31);
    });
  });
});
