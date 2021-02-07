const http = require('http-status-codes').StatusCodes;
const request = require('supertest');

const ExpenseModelStub = require('../../test/stubs/ExpenseModelStub');
const BudgetModelStub = require('../../test/stubs/BudgetModelStub');
const app = require('../../app').app;
const ExpenseRepository = require('../../data').ExpenseRepository;
const BudgetRepository = require('../../data').BudgetRepository;

describe('Route', () => {
  let budgetRepository;
  let expenseRepository;

  beforeAll(() => {
    budgetRepository = new BudgetRepository(BudgetModelStub);
    expenseRepository = new ExpenseRepository(ExpenseModelStub);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
    ExpenseModelStub.resetStore();
  });

  describe('GET /expenses', () => {
    it('should response with 200', async () => {
      await request(app).get('/expenses').expect(http.OK);
    });

    it('should render expenses page', async () => {
      await request(app)
        .get('/expenses')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /expense/:id', () => {
    it('should response with 200', async () => {
      await request(app).get('/expenses/100').expect(http.OK);
    });

    it('should response with 404 if expense does not exist', async () => {
      await request(app).get('/expenses/not_found').expect(http.NOT_FOUND);
    });

    it('should render expenses page', async () => {
      await request(app)
        .get('/expenses/100')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /expenses/filter', () => {
    it('should response with 200', async () => {
      await request(app).get('/expenses/filter?budgetName=Essence').expect(http.OK);
    });

    it('should render expenses filtered page', async () => {
      await request(app)
        .get('/expenses/filter?budgetName=Essence')
        .then((res) => {
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
      await request(app)
        .post('/expenses')
        .set('Content-Type', 'application/json')
        .send(newExpense)
        .expect(http.OK)
        .then(async () => {
          const expenses = await expenseRepository.find();
          const expensesFound = expenses.filter((expense) => {
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
      await request(app)
        .delete('/expenses/100')
        .expect(http.NO_CONTENT)
        .then(async () => {
          const allExpenses = await expenseRepository.find();
          const expenseNotFound = allExpenses.find((expense) => {
            return expense._id === 100;
          });

          expect(expenseNotFound).toBeUndefined();

          const allBudgets = await budgetRepository.find();
          const budgetList = allBudgets.find((budget) => {
            return budget._id === '4';
          });
          const expenseNotFoundInBudgetLine = budgetList.expenses.find((expense) => {
            return expense._id === 100;
          });

          expect(expenseNotFoundInBudgetLine).toBeUndefined();
        });
    });

    it('should return a 404 error when the expense can not be deleted', async () => {
      await request(app).delete('/expenses/404').expect(http.NOT_FOUND);
    });

    it('should return a 500 error when the budget line does not exists', async () => {
      let newExpense = new ExpenseModelStub({ name: 'todelete', budgetLine: { _id: 'notExist'} });
      newExpense = await newExpense.save();
      await request(app).delete(`/expenses/${newExpense._id}`).expect(http.INTERNAL_SERVER_ERROR);
    });

    it('should return a 500 error when expense does not exist in budget line', async () => {
      let newExpense = new ExpenseModelStub({ name: 'todelete', budgetLine: { _id: '1'} });
      newExpense = await newExpense.save();
      await request(app).delete(`/expenses/${newExpense._id}`).expect(http.INTERNAL_SERVER_ERROR);
    });
  });

  describe('PATCH /expenses', () => {
    const expenseId = '100';

    let expenseBeforeUpdate;

    beforeEach(async () => {
      const expenses = await expenseRepository.find({ _id: expenseId });
      expenseBeforeUpdate = expenses[0];
    });

    it.each([
      ['name', 'new name'],
      ['amount', 42],
      ['date', '2021-02-02'],
    ])('should update the expense %s', async (field, value) => {
      await request(app)
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({ 
          [field]: value,
          budgetLine: {
            _id: expenseBeforeUpdate.budgetLine._id
          }
        })
        .expect(http.OK);

      const expenses = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0][field]).toEqual(value);
    });

    it('should not update the expense budget line ', async () => {
      await request(app)
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          budgetLine: {
            _id: 'new_budget_line_id',
          }
        })
        .expect(http.OK);

      const expenses = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0]).toEqual(expenseBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await request(app)
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({
          name: 'new name',
          notexist: 'should not add',
          dont: 'aie',
          budgetlineId: expenseBeforeUpdate.budgetLine._id,
        })
        .expect(http.OK);

      const expenses = await expenseRepository.find({ _id: expenseId });
      expect(expenses[0].notexist).toBeUndefined();
      expect(expenses[0].dont).toBeUndefined();
    });

    it('should return 404 when expense does not exists', async () => {
      await request(app)
        .post(`/expenses/not-exists`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(http.NOT_FOUND);
    });

    it('should render expenses page', async () => {
      await request(app)
        .post(`/expenses/${expenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100, budgetlineId: expenseBeforeUpdate.budgetLine._id })
        .expect(http.OK)
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });
});
