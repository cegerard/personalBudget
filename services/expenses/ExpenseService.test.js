const ExpenseRepository = require('../../data').ExpenseRepository;
const expenseFixture = require('../../test/fixtures/expenseFixture');
const ExpenseModelStub = require('../../test/stubs/ExpenseModelStub');
const ExpenseService = require('./ExpenseService');

describe('ExpenseService', () => {
  let expenseService;

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
        budgetLine: {
          name: 'Course'
        }
      }
      const foundExpenses = await expenseService.search(query);
      expect(foundExpenses).toEqual([expenseFixture.list[2]]);
    });
  });

  describe('add', () => {
    it('should create a new expense', async () => {
      const expectedExpense = {
        id: expect.any(String),
        name: 'expense name',
        amount: 34,
        date: '2020-10-08',
        budgetLine: {
          id: '1',
          name: "bduget"
        }
      };
      const createdExpense = await expenseService.add({
        name: expectedExpense.name,
        amount: expectedExpense.amount,
        date: expectedExpense.date,
        budgetLine: expectedExpense.budgetLine
      });
      const storedExpense = await ExpenseModelStub.findById(createdExpense.id, []);

      expect(createdExpense).toEqual(expectedExpense);
      expect(storedExpense).toEqual(expectedExpense)
    });
  });

  describe('remove', () => {
    const EXPENSE_ID = '101';
    const BUDGET_ID = '4';

    it('should remove an existing expense from its id', async () => {
      const isDeleted = await expenseService.remove({id: EXPENSE_ID});
      
      expect(isDeleted).toEqual(true);
    });

    it('should remove all existing expenses from there budget id', async () => {
      const isDeleted = await expenseService.remove({'budgetLine.id': BUDGET_ID});
      
      expect(isDeleted).toEqual(true);
      expect(ExpenseModelStub.expenseStore.length).toEqual(1);
    });

    it('should do nothing for a non existing budget', async () => {
      const isDeleted = await expenseService.remove('unkown');
      
      expect(isDeleted).toEqual(false);
    });
  });
});