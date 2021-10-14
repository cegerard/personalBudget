import StatusCodes from 'http-status-codes';

import application from '../../app';
import ExpenseRepositoryStub from '../../test/stubs/ExpenseRepositoryStub';
import { authenticate } from '../../test/authHelper';

const expenseRepository = application.expenseRepository as ExpenseRepositoryStub;

let app: any = null;

describe('expenses', () => {
  beforeEach(async () => {
    expenseRepository.resetStore();
    app = await authenticate(application.app);
  });

  describe('GET /expenses/:id', () => {
    describe('when the expense exists', () => {
      it('should respond an expense', async () => {
        await app.get('/api/expenses/100').expect({
          _id: '100',
          name: 'Cmax',
          amount: 41,
          date: '2020-08-29',
          budgetLine: {
            _id: '4',
            name: 'Essence',
          },
        });
      });
    });

    describe('when the expense does not exists', () => {
      it('should respond not found', async () => {
        await app.get('/api/expenses/not-exist').expect(StatusCodes.NOT_FOUND);
      });
    });
  });
});
