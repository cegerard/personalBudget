import { MongoExpenseRepository } from '../../db/mongo';
import expenseFixture from '../../test/fixtures/expenseFixture';
import ExpenseModelStub from '../../test/stubs/ExpenseModelStub';
import ExpenseService from './ExpenseService';

describe('ExpenseService', () => {
  let expenseService: ExpenseService;

  beforeAll(() => {
    const expenseRepository = new MongoExpenseRepository(ExpenseModelStub);
    expenseService = new ExpenseService(expenseRepository);
  });

  beforeEach(() => {
    ExpenseModelStub.resetStore();
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
