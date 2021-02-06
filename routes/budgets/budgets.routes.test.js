const http = require('http-status-codes').StatusCodes;
const slugify = require('slugify');
const request = require('supertest');

const BudgetModelStub = require('../../test/stubs/BudgetModelStub');
const ExpenseModelStub = require('../../test/stubs/ExpenseModelStub');
const app = require('../../app').app;
const BudgetRepository = require('../../data').BudgetRepository;
const ExpenseRepository = require('../../data').ExpenseRepository;

describe('/budgets', () => {
  let budgetRepository;
  let expenseRepository;

  beforeAll(() => {
    budgetRepository = new BudgetRepository(BudgetModelStub);
    expenseRepository = new ExpenseRepository(ExpenseModelStub);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
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

  describe('POST /budgets', () => {
    const newBudget = {
      name: 'budget Name',
      amount: 42,
      description: 'little description',
      category: 'cat'
    };

    it('should create a new budget line', async () => {
      await request(app)
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send(newBudget)
        .expect(http.OK);

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
        category: 'cat',
      });
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
      ['category', 'cat']
    ])('should update the budget %s', async (field, value) => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ [field]: value })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget[field]).toEqual(value);
    });

    it('should not update other budget attributes', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      delete budget.name;
      expect(budget).toEqual(budgetBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name', notexist: 'should not add', dont: 'aie' })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.notexist).toBeUndefined();
      expect(budget.dont).toBeUndefined();
    });

    it('should update the slug with the name', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.slug).toEqual('new-name');
    });

    it('should update the available value when amount is updated', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 666 })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.available).toEqual(666);
    });

    it('should update the available value with expenses', async () => {
      const budgetWithExpenseId = '4';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(http.OK);

      const budget = await budgetRepository.findOneById(budgetWithExpenseId);
      expect(budget.available).toEqual(29);
    });

    it('should return 404 when budget does not exists on amount update', async () => {
      const budgetWithExpenseId = 'not-exists';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(http.NOT_FOUND);
    });

    it('should render budget details page', async () => {
      const budgetWithExpenseId = '4';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });
});
