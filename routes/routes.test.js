const slugify = require('slugify');
const request = require('supertest');

const app = require('../app'); // Beware test order is important as we avec static data (json) load once before all test, remove that when repository is abstracted.
const { expenseRepository, budgetRepository } = require('../data');

describe('Route', () => {
  describe('GET /notFound', () => {
    it('should response with 404', async () => {
      await request(app).get('/notFound').expect(404);
    });
  });

  describe('GET /', () => {
    it('should response with 302', async () => {
      await request(app).get('/').expect(302);
    });

    it('should render home page', async () => {
      await request(app)
        .get('/')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /budgets', () => {
    it('should response with 200', async () => {
      await request(app).get('/budgets').expect(200);
    });

    it('should render budgets page', async () => {
      await request(app)
        .get('/budgets')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /expenses', () => {
    it('should response with 200', async () => {
      await request(app).get('/expenses').expect(200);
    });

    it('should render expenses page', async () => {
      await request(app)
        .get('/expenses')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /expenses/filter', () => {
    it('should response with 200', async () => {
      await request(app).get('/expenses/filter?budgetName=Essence').expect(200);
    });

    it('should render expenses filtered page', async () => {
      await request(app)
        .get('/expenses/filter?budgetName=Essence')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('POST /budgets', () => {
    const newBudget = {
      name: 'budget Name',
      amount: 42,
      description: 'little description',
    };

    it('should create a new budget line', async () => {
      await request(app)
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send(newBudget)
        .expect(200)
        .then(() => {
          const budgetsFound = budgetRepository.find().filter((budget) => {
            return budget.name === newBudget.name;
          });
          expect(budgetsFound.length).toEqual(1);
          expect(budgetsFound[0]).toMatchObject({
            id: expect.any(String),
            name: newBudget.name,
            slug: slugify(newBudget.name),
            amount: newBudget.amount,
            description: newBudget.description,
            available: newBudget.amount,
            expenses: [],
          });
        });
    });

    it('should trigger a 500 error', async () => {
      await request(app)
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(500);
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
        .expect(200)
        .then(() => {
          const expensesFound = expenseRepository.find().filter((expense) => {
            return expense.name === newExpense.name;
          });
          expect(expensesFound.length).toEqual(1);
          expect(expensesFound[0]).toMatchObject({
            id: expect.any(String),
            name: newExpense.name,
            amount: newExpense.amount,
            date: newExpense.date,
            budgetLine: {
              id: newExpense.budgetlineId,
              name: 'Electricité',
            },
          });
        });
    });
  });

  describe('DELETE /expenses', () => {
    it('should remove expense from expense list and the budget line', async () => {
      await request(app)
        .delete('/expenses/100')
        .expect(204)
        .then(() => {
          const expenseNotFound = expenseRepository.find().find((expense) => {
            return expense.id === 100;
          });

          expect(expenseNotFound).toBeUndefined();

          const budgetList = budgetRepository.find().find((budget) => {
            return budget.id === '4';
          });
          const expenseNotFoundInBudgetLine = budgetList.expenses.find((expense) => {
            return expense.id === 100;
          });

          expect(expenseNotFoundInBudgetLine).toBeUndefined();
        });
    });

    it('should return a 500 error when the expense can not be deleted', async () => {
      await request(app).delete('/expenses/404').expect(500);
    });
  });

  describe('DELETE /budgets', () => {
    it('should remove budget line and all its expenses', async () => {
      await request(app)
        .delete('/budgets/4')
        .expect(204)
        .then(() => {
          const budgetNotFound = budgetRepository.find().find((budget) => {
            return budget.id === '4';
          });

          expect(budgetNotFound).toBeUndefined();

          const expensesFound = expenseRepository.find().filter((expense) => {
            return expense.budgetLine.id === '4';
          });

          expect(expensesFound.length).toEqual(0);
        });
    });

    it('should return a 500 error when the budget can not be deleted', async () => {
      await request(app).delete('/budgets/404').expect(500);
    });
  });
});
