import StatusCodes from 'http-status-codes';
import request from 'supertest';

import application from '../../../app';
import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../test/stubs/ExpenseRepositoryStub';
import { authenticate } from '../../../test/authHelper';

const budgetRepository = application.budgetRepository as BudgetRepositoryStub;
const expenseRepository = application.expenseRepository as ExpenseRepositoryStub;

let app: any = null;

describe('Expenses with authentication', () => {
  beforeEach(async () => {
    budgetRepository.resetStore();
    expenseRepository.resetStore();
    app = await authenticate(application.app);
  });

  describe('GET /expenses', () => {
    it('should response with 200', async () => {
      await app.get('/expenses').expect(StatusCodes.OK);
    });

    it('should render expenses page', async () => {
      await app.get('/expenses').then((res: any) => {
        expect(res.text).toMatchSnapshot();
      });
    });
  });

  describe('GET /expenses/filter', () => {
    it('should response with 200', async () => {
      await app.get('/expenses/filter?budgetName=Essence').expect(StatusCodes.OK);
    });

    it('should render expenses filtered page', async () => {
      await app.get('/expenses/filter?budgetName=Essence').then((res: any) => {
        expect(res.text).toMatchSnapshot();
      });
    });
  });

  describe('POST /expenses', () => {
    const newExpense = {
      name: 'test expense',
      amount: 12,
      date: '2020-09-10',
      budgetlineId: '1',
    };

    it('should create a new expense', async () => {
      await app
        .post('/expenses')
        .set('Content-Type', 'application/json')
        .send(newExpense)
        .expect(StatusCodes.OK)
        .then(async () => {
          const expenses = await expenseRepository.find();
          const expensesFound = expenses.filter((expense: any) => {
            return expense.name === newExpense.name;
          });
          expect(expensesFound.length).toEqual(1);
          expect(expensesFound[0]).toMatchObject({
            _id: expect.any(String),
            name: newExpense.name,
            amount: newExpense.amount,
            date: newExpense.date,
            budgetLine: {
              _id: newExpense.budgetlineId,
              name: 'Electricité',
            },
            owner: {
              id: '0001',
              name: 'admin istrator',
            },
          });
        });
    });

    // TODO add error mangement
    // it('should return 404 if budget not found', async () => {
    //   newExpense.budgetlineId = 'notfound';
    //   await request(app)
    //     .post('/expenses')
    //     .set('Content-Type', 'application/json')
    //     .send(newExpense)
    //     .expect(404);
    // });
  });

  describe('DELETE /expenses', () => {
    it('should remove expense from expense list and the budget line', async () => {
      await app
        .delete('/expenses/100')
        .expect(StatusCodes.NO_CONTENT)
        .then(async () => {
          const allExpenses = await expenseRepository.find(undefined);
          const expenseNotFound = allExpenses.find((expense: any) => {
            return expense._id === 100;
          });

          expect(expenseNotFound).toBeUndefined();

          const budgetList = await budgetRepository.getById('4');
          const expenseNotFoundInBudgetLine = budgetList.expenses.find((expense: any) => {
            return expense._id === 100;
          });

          expect(expenseNotFoundInBudgetLine).toBeUndefined();
        });
    });

    it('should return a 404 error when the expense can not be deleted', async () => {
      await app.delete('/expenses/404').expect(StatusCodes.NOT_FOUND);
    });

    it('should return a 500 error when the budget line does not exists', async () => {
      const newExpense = await expenseRepository.create({
        name: 'todelete',
        amount: 42,
        date: '',
        budgetLine: { _id: 'notExist', name: 'test' },
        owner: { id: '0001', name: 'admin istrator' },
      });

      await app.delete(`/expenses/${newExpense._id}`).expect(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return a 204 when expense does not exist in budget line', async () => {
      const newExpense = await expenseRepository.create({
        name: 'todelete',
        amount: 42,
        date: '',
        budgetLine: { _id: '1', name: 'test' },
        owner: { id: '0001', name: 'admin istrator' },
      });

      await app.delete(`/expenses/${newExpense._id}`).expect(StatusCodes.NO_CONTENT);
    });
  });

  describe('PATCH /expenses', () => {
    const expenseId = '100';

    let expenseBeforeUpdate: any;

    beforeEach(async () => {
      const expenses = await expenseRepository.find({ _id: expenseId });
      expenseBeforeUpdate = expenses[0];
    });

    it.each([
      ['name', 'new name'],
      ['amount', 42],
      ['date', '2021-02-02'],
    ])('should update the expense %s', async (field, value) => {
      await app
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          [field]: value,
          budgetLine: {
            _id: expenseBeforeUpdate.budgetLine._id,
          },
        })
        .expect(StatusCodes.OK);

      const expenses: any = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0][field]).toEqual(value);
    });

    it('should not update the expense budget line ', async () => {
      await app
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          budgetLine: {
            _id: 'new_budget_line_id',
          },
        })
        .expect(StatusCodes.OK);

      const expenses = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0]).toEqual(expenseBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await app
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          name: 'new name',
          notexist: 'should not add',
          dont: 'aie',
          budgetlineId: expenseBeforeUpdate.budgetLine._id,
        })
        .expect(StatusCodes.OK);

      const expenses: any = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0].notexist).toBeUndefined();
      expect(expenses[0].dont).toBeUndefined();
    });

    it('should return 404 when expense does not exists', async () => {
      await app
        .post(`/expenses/not-exists`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should render expenses page', async () => {
      await app
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100, budgetlineId: expenseBeforeUpdate.budgetLine._id })
        .expect(StatusCodes.OK)
        .then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });
});

describe('Expenses without authentication', () => {
  beforeEach(() => {
    app = request(application.app);
  });

  describe('GET /expenses', () => {
    it('should response with 401', async () => {
      await app.get('/expenses').expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should render home page', async () => {
      await app.get('/expenses').then((res: any) => {
        expect(res.text).toMatchSnapshot();
      });
    });
  });

  describe('GET /expenses/filter', () => {
    it('should response with 401', async () => {
      await app.get('/expenses/filter?budgetName=Essence').expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should render the home page', async () => {
      await app.get('/expenses/filter?budgetName=Essence').then((res: any) => {
        expect(res.text).toMatchSnapshot();
      });
    });
  });

  describe('POST /expenses', () => {
    const newExpense = {
      name: 'test expense',
      amount: 12,
      date: '2020-09-10',
      budgetlineId: '1',
    };

    it('should do nothing', async () => {
      await app
        .post('/expenses')
        .set('Content-Type', 'application/json')
        .send(newExpense)
        .expect(StatusCodes.MOVED_TEMPORARILY)
        .then(async () => {
          const expenses = await expenseRepository.find(undefined);
          const expensesFound = expenses.filter((expense: any) => {
            return expense.name === newExpense.name;
          });
          expect(expensesFound.length).toEqual(0);
        });
    });
  });

  describe('DELETE /expenses', () => {
    it('should return unauthorized', async () => {
      await app.delete('/expenses/100').expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should return a 404 error when the expense can not be deleted', async () => {
      await app.delete('/expenses/404').expect(StatusCodes.MOVED_TEMPORARILY);
    });
  });

  describe('PATCH /expenses', () => {
    const expenseId = '100';

    let expenseBeforeUpdate: any;

    beforeEach(async () => {
      const expenses = await expenseRepository.find({ _id: expenseId });
      expenseBeforeUpdate = expenses[0];
    });

    it('should return unauthorized', async () => {
      await app
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          budgetLine: {
            _id: 'new_budget_line_id',
          },
        })
        .expect(StatusCodes.MOVED_TEMPORARILY);
    });
  });
});
