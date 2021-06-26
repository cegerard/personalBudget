import MongoExpenseRepository from './MongoExpenseRepository';
import expenseFixture from '../../../test/fixtures/expenseFixture';
import ExpenseModelStub from '../../../test/stubs/ExpenseModelStub';

describe('ExpenseService', () => {
  let expenseRepository: MongoExpenseRepository;

  beforeAll(() => {
    expenseRepository = new MongoExpenseRepository(ExpenseModelStub);
  });

  beforeEach(() => {
    ExpenseModelStub.resetStore();
  });

  describe('find', () => {
    it('should return the list of expenses', async () => {
      const list = await expenseRepository.find();
      expect(list).toEqual(expenseFixture.list);
    });

    it('should search from budget name', async () => {
      const query = {
        'budgetLine.name': 'Course',
      };
      const foundExpenses = await expenseRepository.find(query);
      expect(foundExpenses).toEqual([expenseFixture.list[2]]);
    });

    it('should return an empty array when budget name does not exist', async () => {
      const query = {
        'budgetLine.name': 'oups',
      };
      const foundExpenses = await expenseRepository.find(query);
      expect(foundExpenses).toEqual([]);
    });
  });

  describe('create', () => {
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
      const createdExpense = await expenseRepository.create({
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

  describe('delete', () => {
    const EXPENSE_ID = '101';
    const BUDGET_ID = '4';

    it('should remove an existing expense from its id', async () => {
      const isDeleted = await expenseRepository.delete({ _id: EXPENSE_ID });

      expect(isDeleted).toEqual(true);
    });

    it('should remove all existing expenses from there budget id', async () => {
      const isDeleted = await expenseRepository.delete({ 'budgetLine._id': BUDGET_ID });

      expect(isDeleted).toEqual(true);
      expect(ExpenseModelStub.expenseStore.length).toEqual(1);
    });

    it('should do nothing for a non existing budget', async () => {
      const isDeleted = await expenseRepository.delete({ 'budgetLine._id': 'unknown' });

      expect(isDeleted).toEqual(false);
    });
  });
});