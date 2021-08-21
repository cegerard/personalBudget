import StatusCodes from 'http-status-codes';
import request from 'supertest';

import application from '../../app';
import ExpenseRepositoryStub from '../../test/stubs/ExpenseRepositoryStub';

const app = application.app;
const expenseRepository = application.expenseRepository as ExpenseRepositoryStub;

describe('expenses', () => {
  beforeEach(() => {
    expenseRepository.resetStore();
  });

  describe('GET /expenses/:id', () => {
    describe('when the expense exists', () => {
      it('should respond an expense', async () => {
        await request(app)
          .get('/api/expenses/100')
          .expect({
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
        await request(app).get('/api/expenses/not-exist').expect(StatusCodes.NOT_FOUND);
      });
    });
  });
});
