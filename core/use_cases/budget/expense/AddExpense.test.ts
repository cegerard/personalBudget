import BudgetRepositoryStub from '../../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../../test/stubs/ExpenseRepositoryStub';
import { readBudgetComplete } from '../../../@types/budget/types';
import AddExpense from './AddExpense';

describe('BudgetService', () => {
  const THIRD_BUDGET_ID = '3';
  const FOURTH_BUDGET_ID = '4';

  let budgetRepository: BudgetRepositoryStub;
  let expenseRepository: ExpenseRepositoryStub;

  let thirdBudget: readBudgetComplete;
  let fourthBudget: readBudgetComplete;

  beforeAll(() => {
    budgetRepository = new BudgetRepositoryStub();
    expenseRepository = new ExpenseRepositoryStub();
  });

  beforeEach(async () => {
    budgetRepository.resetStore();
    expenseRepository.resetStore();

    thirdBudget = await budgetRepository.getById(THIRD_BUDGET_ID);
    fourthBudget = await budgetRepository.getById(FOURTH_BUDGET_ID);
  });

  describe('add', () => {
    const newExpense = {
      _id: '42',
      name: 'new expense',
      amount: 42,
      date: '2020-12-29',
    };

    it('should return that the expense has been added', async () => {
      const isReplaced = await new AddExpense(fourthBudget, budgetRepository).add(newExpense);
      expect(isReplaced).toEqual(true);
    });

    it('should add a the expense to the budget expense array', async () => {
      await new AddExpense(fourthBudget, budgetRepository).add(newExpense);
      const updatedBudget = await budgetRepository.getById(FOURTH_BUDGET_ID);

      expect(updatedBudget.expenses.length).toEqual(3);
      expect(updatedBudget.expenses[2]).toEqual(newExpense);
    });

    it('should update the budget available field', async () => {
      await new AddExpense(fourthBudget, budgetRepository).add(newExpense);
      const updatedBudget = await budgetRepository.getById(FOURTH_BUDGET_ID);

      expect(updatedBudget.available).toEqual(37);
    });

    it('should update the budget available field with correct parsing', async () => {
      await new AddExpense(thirdBudget, budgetRepository).add({
        _id: '42',
        name: 'new expense',
        amount: -1.19,
        date: '2020-12-29',
      });
      const updatedBudget = await budgetRepository.getById(THIRD_BUDGET_ID);

      expect(updatedBudget.available).toEqual(858.31);
    });
  });
});
