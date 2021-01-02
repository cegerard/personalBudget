const slugify = require('slugify');
const request = require('supertest');

const ExpenseModelStub = require('../test/stubs/ExpenseModelStub');
const BudgetModelStub = require('../test/stubs/BudgetModelStub');
const app = require('../app').app;
const ExpenseRepository = require('../data').ExpenseRepository;
const BudgetRepository = require('../data').BudgetRepository;

describe('Route', () => {
  let budgetRepository;
  let expenseRepository;
  beforeAll(() => {
    BudgetModelStub.resetStore();
    ExpenseModelStub.resetStore();
    budgetRepository = new BudgetRepository(BudgetModelStub);
    expenseRepository = new ExpenseRepository(ExpenseModelStub);
  });

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
        .then(async () => {
          const budgets = await budgetRepository.find();
          const budgetsFound = budgets.filter((budget) => {
            return budget.name === newBudget.name;
          });
          expect(budgetsFound.length).toEqual(1);
          expect(budgetsFound[0]).toMatchObject({
            _id: expect.any(String),
            name: newBudget.name,
            slug: slugify(newBudget.name),
            amount: newBudget.amount,
            description: newBudget.description,
            available: newBudget.amount,
            expenses: [],
          });
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
        .expect(200)
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
        .expect(204)
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
      await request(app).delete('/expenses/404').expect(404);
    });
  });

  describe('DELETE /budgets', () => {
    it('should remove budget line and all its expenses', async () => {
      await request(app)
        .delete('/budgets/4')
        .expect(204)
        .then(async () => {
          const allBudgets = await budgetRepository.find();
          const budgetNotFound = allBudgets.find((budget) => {
            return budget._id === '4';
          });

          expect(budgetNotFound).toBeUndefined();

          const allExpenses = await expenseRepository.find();
          const expensesFound = allExpenses.filter((expense) => {
            return expense.budgetLine._id === '4';
          });

          expect(expensesFound.length).toEqual(0);
        });
    });

    it('should return a 404 error when the budget can not be deleted', async () => {
      await request(app).delete('/budgets/404').expect(404);
    });
  });
});
