import { MongoBudgetRepository, ExpenseRepository } from '../../data';
import budgetFixture from '../../test/fixtures/budgetFixture';
import ExpenseModelStub from '../../test/stubs/ExpenseModelStub';
import BudgetModelStub from '../../test/stubs/BudgetModelStub';
import BudgetService from './BudgetService';
import { Budget } from '../../core/Budget';
import { budgetType } from '../../core/@types/budget/types';

describe('BudgetService', () => {
  const SECOND_BUDGET_ID = '2';
  const THIRD_BUDGET_ID = '3';
  const FOURTH_BUDGET_ID = '4';

  let budgetService: BudgetService;

  beforeAll(() => {
    const budgetRepository = new MongoBudgetRepository(BudgetModelStub);
    const expenseRepository = new ExpenseRepository(ExpenseModelStub);
    budgetService = new BudgetService(budgetRepository, expenseRepository);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
    ExpenseModelStub.resetStore();
  });

  describe('list', () => {
    it('should return the list of budgets', async () => {
      const list = await budgetService.list([]);
      expect(list).toEqual(budgetFixture.list);
    });

    it('should return the list of projected budget fields', async () => {
      const expectedBudgetList = budgetFixture.list.map((budget) => {
        return {
          _id: budget._id,
          name: budget.name,
          amount: budget.amount,
        };
      });
      const list = await budgetService.list(['_id', 'name', 'amount']);
      expect(list).toEqual(expectedBudgetList);
    });
  });

  describe('getById', () => {
    it('should return a budget from its id', async () => {
      const budget = await budgetService.getById(SECOND_BUDGET_ID, []);
      expect(budget).toEqual(budgetFixture.list[1]);
    });

    it('should return a projected budget from its id with fields projection', async () => {
      const expectedProjectedBudget = {
        description: budgetFixture.list[1].description,
        name: budgetFixture.list[1].name,
        amount: budgetFixture.list[1].amount,
      };

      const budget = await budgetService.getById(SECOND_BUDGET_ID, [
        'name',
        'amount',
        'description',
      ]);

      expect(budget).toEqual(expectedProjectedBudget);
    });
  });

  describe('create', () => {
    it('should create a new budget with default values', async () => {
      const expectedBudget = {
        _id: expect.any(String),
        name: 'BudgetName',
        slug: 'budgetname',
        amount: 100,
        available: 100,
        description: 'budget description',
        expenses: [],
        type: 'NORMAL',
      };

      await budgetService.create(
        new Budget(expectedBudget.name, expectedBudget.amount, expectedBudget.description)
      );
      const res = await BudgetModelStub.find(null, []);
      const storedBudget = (await BudgetModelStub.find(null, [])).find(
        (budget) => budget.name === 'BudgetName'
      );

      expect(storedBudget).toEqual(expectedBudget);
    });

    it('should create a new budget with all values', async () => {
      const expectedBudget = {
        _id: expect.any(String),
        name: 'BudgetName',
        slug: 'budgetname',
        amount: 100,
        available: 100,
        description: 'budget description',
        expenses: [],
        category: 'test',
        type: 'RESERVE',
      };

      await budgetService.create(
        new Budget(
          expectedBudget.name,
          expectedBudget.amount,
          expectedBudget.description,
          'RESERVE',
          'test'
        )
      );
      const storedBudget = (await BudgetModelStub.find(null, [])).find(
        (budget) => budget.name === 'BudgetName'
      );

      expect(storedBudget).toEqual(expectedBudget);
    });
  });

  describe('remove', () => {
    it('should remove an existing budget', async () => {
      const isDeleted = await budgetService.remove(SECOND_BUDGET_ID);

      expect(isDeleted).toEqual(true);
    });

    it('should do nothing for a non existing budget', async () => {
      const isDeleted = await budgetService.remove('unkown');

      expect(isDeleted).toEqual(false);
    });
  });

  describe('patch', () => {
    const budget_id = '7';

    it('should update field for an existing budget', async () => {
      const expectedBudget = {
        _id: budget_id,
        name: 'Rename',
        slug: 'rename',
        amount: 30,
        available: 30,
        description: 'it has been updated',
        category: 'add cat',
        expenses: [],
        type: 'RESERVE',
      };

      await budgetService.patch(budget_id, {
        name: expectedBudget.name,
        amount: expectedBudget.amount,
        description: expectedBudget.description,
        category: expectedBudget.category,
        type: expectedBudget.type as budgetType,
      });

      const updatedBudget = await BudgetModelStub.findById(budget_id, []);
      expect(updatedBudget).toEqual(expectedBudget);
    });

    it('should return true on update', async () => {
      const res = await budgetService.patch(budget_id, { name: 'test' });

      expect(res).toBe(true);
    });

    it('should return false when update failed', async () => {
      const res = await budgetService.patch('not exists', { name: 'test' });

      expect(res).toBe(false);
    });
  });

  describe('addExpense', () => {
    const newExpense = {
      _id: '42',
      name: 'new expense',
      amount: 42,
      date: '2020-12-29',
    };

    it('should return that the expense has been added', async () => {
      const isReplaced = await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      expect(isReplaced).toEqual(true);
    });

    it('should add a the expense to the budget expense array', async () => {
      await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(3);
      expect(updatedBudget.expenses[2]).toEqual(newExpense);
    });

    it('should update the budget available field', async () => {
      await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(37);
    });

    it('should update the budget available field with correct parsing', async () => {
      await budgetService.addExpense(THIRD_BUDGET_ID, {
        _id: '42',
        name: 'new expense',
        amount: -1.19,
        date: '2020-12-29',
      });
      const updatedBudget = await BudgetModelStub.findById(THIRD_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(858.31);
    });
  });

  describe('removeExpense', () => {
    const expenseId = '100';

    it('should return that the expense has been removed', async () => {
      const isRemoved = await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      expect(isRemoved).toEqual(true);
    });

    it('should remove the expense from the expenses array', async () => {
      await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(1);
      expect(updatedBudget.expenses[0]._id).toEqual('101');
    });

    it('should update the available field', async () => {
      await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(120);
    });
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
        await ExpenseModelStub.updateOne(
          { _id: EXPENSE_ID },
          {
            name: EXPECTED_EXPENSE.name,
            amount: EXPECTED_EXPENSE.amount,
            date: EXPECTED_EXPENSE.date,
          }
        );
      });

      it('should return that the expense has been updated', async () => {
        const isUpdated = await budgetService.updateExpense(EXPENSE_ID);
        expect(isUpdated).toEqual(true);
      });

      it('should update the expense in its budget line', async () => {
        await budgetService.updateExpense(EXPENSE_ID);
        const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);
        expect(updatedBudget.expenses[0]).toEqual(EXPECTED_EXPENSE);
      });
    });

    describe('when the expense does not exist', () => {
      const UNKNOWN_EXPENSE_ID = 'unknown';

      it('should return false', async () => {
        const isUpdated = await budgetService.updateExpense(UNKNOWN_EXPENSE_ID);
        expect(isUpdated).toEqual(false);
      });
    });

    describe('when the expense is not found from its budget line', () => {
      const MISSING_EXPENSE_ID = '200';
      it('should return false', async () => {
        const isUpdated = await budgetService.updateExpense(MISSING_EXPENSE_ID);
        expect(isUpdated).toEqual(false);
      });
    });
  });
});
