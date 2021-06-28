import { MongoExpenseRepository } from '../../../db/mongo';
import ExpenseRepositoryStub from '../../../test/stubs/ExpenseRepositoryStub';
import UpdateExpense from './UpdateExpense';

describe('UpdateExpense', () => {
  const expenseRepository = new ExpenseRepositoryStub();
  let expenseService: UpdateExpense;

  beforeEach(() => {
    expenseRepository.resetStore();
  });

  describe('update', () => {
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
        expenseService = new UpdateExpense(EXPENSE_ID, expenseRepository);
        patchRes = await expenseService.update({
          name: EXPECTED_EXPENSE.name,
          amount: EXPECTED_EXPENSE.amount,
          date: EXPECTED_EXPENSE.date,
        });
      });

      it('should update the expense attributes', async () => {
        const expense = await expenseRepository.findById(EXPENSE_ID);
        expect(expense).toEqual(EXPECTED_EXPENSE);
      });

      it('should return true', async () => {
        expect(patchRes).toEqual(true);
      });
    });

    describe('when the expense does not exist', () => {
      const EXPENSE_ID = 'unkown';

      beforeEach(async () => {
        expenseService = new UpdateExpense(EXPENSE_ID, expenseRepository);
      });

      it('should return false', async () => {
        const patchRes = await expenseService.update({});

        expect(patchRes).toEqual(false);
      });
    });
  });
});
