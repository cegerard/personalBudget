const http = require('http-status-codes').StatusCodes;
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
    budgetRepository = new BudgetRepository(BudgetModelStub);
    expenseRepository = new ExpenseRepository(ExpenseModelStub);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
    ExpenseModelStub.resetStore();
  });

  describe('GET /notFound', () => {
    it('should response with 404', async () => {
      await request(app).get('/notFound').expect(http.NOT_FOUND);
    });
  });

  describe('GET /', () => {
    it('should response with 302', async () => {
      await request(app).get('/').expect(http.MOVED_TEMPORARILY);
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
      await request(app).get('/budgets').expect(http.OK);
    });

    it('should render budgets page', async () => {
      await request(app)
        .get('/budgets')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('GET /budgets/:id', () => {
    const budgetId = 4;
    const budgetUrl = `/budgets/${budgetId}`;

    it('should response with 200', async () => {
      await request(app).get(budgetUrl).expect(http.OK);
    });

    it('should render budget details page', async () => {
      await request(app)
        .get(budgetUrl)
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
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
        .expect(http.OK)
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
      await request(app).delete('/expenses/404').expect(404);
    });
  });

  describe('DELETE /budgets', () => {
    it('should remove budget line and all its expenses', async () => {
      await request(app)
        .delete('/budgets/4')
        .expect(http.NO_CONTENT)
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

  describe('PATCH /budgets', () => {
    const budgetId = '5';

    let budgetBeforeUpdate;

    beforeEach(async () => {
      budgetBeforeUpdate = await budgetRepository.findOneById(budgetId);
      delete budgetBeforeUpdate.name;
    });

    it.each([
      ['name', 'new name'],
      ['amount', 42],
      ['description', 'the description'],
    ])('should update the budget %s', async (field, value) => {
      await request(app)
        .patch(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ [field]: value })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget[field]).toEqual(value);
    });

    it('should not update other budget attributes', async () => {
      await request(app)
        .patch(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetId);
      delete budget.name;
      expect(budget).toEqual(budgetBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await request(app)
        .patch(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name', notexist: 'should not add', dont: 'aie' })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.notexist).toBeUndefined();
      expect(budget.dont).toBeUndefined();
    });

    it('should update the slug with the name', async () => {
      await request(app)
        .patch(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.slug).toEqual('new-name');
    });

    it('should update the available value when amount is updated', async () => {
      await request(app)
        .patch(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 666 })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.available).toEqual(666);
    });

    it('should update the available value with expenses', async () => {
      const budgetWithExpenseId = '4';
      await request(app)
        .patch(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(http.NO_CONTENT);

      const budget = await budgetRepository.findOneById(budgetWithExpenseId);
      expect(budget.available).toEqual(29);
    });

    it('should return 404 when budget does not exists on amount update', async () => {
      const budgetWithExpenseId = 'not-exists';
      await request(app)
        .patch(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(http.NOT_FOUND);
    });

    it('should return 404 when budget does not exists on name update', async () => {
      const budgetWithExpenseId = 'not-exists';
      await request(app)
        .patch(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'not found' })
        .expect(http.NOT_FOUND);
    });
  });
});
