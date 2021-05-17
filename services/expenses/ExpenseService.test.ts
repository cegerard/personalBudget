import { ExpenseRepository } from '../../data';
import expenseFixture from '../../test/fixtures/expenseFixture';
import ExpenseModelStub from '../../test/stubs/ExpenseModelStub';
import ExpenseService from './ExpenseService';

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  beforeAll(() => {
    const expenseRepository = new ExpenseRepository(ExpenseModelStub);
    expenseService = new ExpenseService(expenseRepository);
  });

  beforeEach(() => {
    ExpenseModelStub.resetStore();
  });

  describe('list', () => {
    it('should return the list of expenses', async () => {
      const list = await expenseService.list();
      expect(list).toEqual(expenseFixture.list);
    });
  });

  describe('search', () => {
    it('should search from budget name', async () => {
      const query = {
        'budgetLine.name': 'Course',
      };
      const foundExpenses = await expenseService.search(query);
      expect(foundExpenses).toEqual([expenseFixture.list[2]]);
    });

    it('should return an empty array when budget name does not exist', async () => {
      const query = {
        'budgetLine.name': 'oups',
      };
      const foundExpenses = await expenseService.search(query);
      expect(foundExpenses).toEqual([]);
    });
  });

  describe('add', () => {
    it('should create a new expense', async () => {
      const expectedExpense = {
        _id: expect.any(String),
        name: 'expense name',
        amount: 34,
        date: '2020-10-08',
        budgetLine: {
          _id: '1',
          name: 'bduget',
        },
      };
      const createdExpense = await expenseService.add({
        name: expectedExpense.name,
        amount: expectedExpense.amount,
        date: expectedExpense.date,
        budgetLine: expectedExpense.budgetLine,
      });
      const storedExpense = await ExpenseModelStub.findById(createdExpense._id);

      expect(createdExpense).toEqual(expectedExpense);
      expect(storedExpense).toEqual(expectedExpense);
    });
  });

  describe('remove', () => {
    const EXPENSE_ID = '101';
    const BUDGET_ID = '4';

    it('should remove an existing expense from its id', async () => {
      const isDeleted = await expenseService.remove({ _id: EXPENSE_ID });

      expect(isDeleted).toEqual(true);
    });

    it('should remove all existing expenses from there budget id', async () => {
      const isDeleted = await expenseService.remove({ 'budgetLine._id': BUDGET_ID });

      expect(isDeleted).toEqual(true);
      expect(ExpenseModelStub.expenseStore.length).toEqual(1);
    });

    it('should do nothing for a non existing budget', async () => {
      const isDeleted = await expenseService.remove('unkown');

      expect(isDeleted).toEqual(false);
    });
  });

  describe('patch', () => {
    describe('when the expense exists', () => {
      const EXPENSE_ID = '101';
      const EXPECTED_EXPENSE = {
        _id: EXPENSE_ID,
        name: 'new name',
        amount: 100000,
        date: '2021-01-01',
        budgetLine: {
          _id: '4',
          name: 'Essence',
        },
      };

      let patchRes: any;

      beforeEach(async () => {
        patchRes = await expenseService.patch(EXPENSE_ID, {
          name: EXPECTED_EXPENSE.name,
          amount: EXPECTED_EXPENSE.amount,
          date: EXPECTED_EXPENSE.date,
        });
      });

      it('should update the expense attributes', async () => {
        const expense = await ExpenseModelStub.findById(EXPENSE_ID);
        expect(expense).toEqual(EXPECTED_EXPENSE);
      });

      it('should not update the budget line attributes', async () => {
        await expenseService.patch(EXPENSE_ID, {
          budgetLine: {
            _id: '2000',
            name: 'not change',
          },
        });

        const expense = await ExpenseModelStub.findById(EXPENSE_ID);
        expect(expense.budgetLine).toEqual(EXPECTED_EXPENSE.budgetLine);
      });

      it('should return true', async () => {
        expect(patchRes).toEqual(true);
      });
    });

    describe('when the expense does not exist', () => {
      const EXPENSE_ID = 'unkown';

      it('should return false', async () => {
        const patchRes = await expenseService.patch(EXPENSE_ID, {});

        expect(patchRes).toEqual(false);
      });
    });
  });
});
