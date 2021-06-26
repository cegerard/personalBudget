import StatusCodes from 'http-status-codes';
import slugify from 'slugify';
import request from 'supertest';

import BudgetModelStub from '../../test/stubs/BudgetModelStub';
import ExpenseModelStub from '../../test/stubs/ExpenseModelStub';
import application from '../../app';
import { MongoBudgetRepository, MongoExpenseRepository } from '../../data';

const app = application.app;

describe('/budgets', () => {
  let budgetRepository: MongoBudgetRepository;
  let expenseRepository: MongoExpenseRepository;

  beforeAll(() => {
    budgetRepository = new MongoBudgetRepository(BudgetModelStub);
    expenseRepository = new MongoExpenseRepository(ExpenseModelStub);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
  });

  describe('GET /budgets', () => {
    it('should response with 200', async () => {
      await request(app).get('/budgets').expect(StatusCodes.OK);
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
      await request(app).get(budgetUrl).expect(StatusCodes.OK);
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
      category: 'cat',
    };

    it('should create a new budget line', async () => {
      await request(app)
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send(newBudget)
        .expect(StatusCodes.OK);

      const budgets = await budgetRepository.find();
      const budgetsFound = budgets.filter((budget: any) => {
        return budget.name === newBudget.name;
      });
      expect(budgetsFound.length).toEqual(1);
      expect(budgetsFound[0]).toMatchObject({
        _id: expect.any(String),
        name: newBudget.name,
        slug: slugify(newBudget.name, { lower: true }),
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
        .expect(StatusCodes.NO_CONTENT)
        .then(async () => {
          const allBudgets = await budgetRepository.find();
          const budgetNotFound = allBudgets.find((budget: any) => {
            return budget._id === '4';
          });

          expect(budgetNotFound).toBeUndefined();

          const allExpenses = await expenseRepository.find(undefined);
          const expensesFound = allExpenses.filter((expense: any) => {
            return expense.budgetLine._id === '4';
          });

          expect(expensesFound.length).toEqual(0);
        });
    });

    it('should return a 404 error when the budget can not be deleted', async () => {
      await request(app).delete('/budgets/404').expect(404);
    });
  });

  describe('POST /budgets/:id', () => {
    const budgetId = '5';

    let budgetBeforeUpdate: any;

    beforeEach(async () => {
      budgetBeforeUpdate = await budgetRepository.findOneById(budgetId);
      delete budgetBeforeUpdate.name;
    });

    it.each([
      ['name', 'new name'],
      ['amount', 42],
      ['description', 'the description'],
      ['category', 'cat'],
    ])('should update the budget %s', async (field, value) => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ [field]: value })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(budgetId);
      expect(budget[field]).toEqual(value);
    });

    it('should not update other budget attributes', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(budgetId);
      delete budget.name;
      expect(budget).toEqual(budgetBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name', notexist: 'should not add', dont: 'aie' })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(budgetId);
      expect(budget.notexist).toBeUndefined();
      expect(budget.dont).toBeUndefined();
    });

    it('should update the slug with the name', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.slug).toEqual('new-name');
    });

    it('should update the available value when amount is updated', async () => {
      await request(app)
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 666 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(budgetId);
      expect(budget.available).toEqual(666);
    });

    it('should update the available value with expenses', async () => {
      const budgetWithExpenseId = '4';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(budgetWithExpenseId);
      expect(budget.available).toEqual(29);
    });

    it('should set the available value when passed as parameters', async () => {
      const budgetWithExpenseId = '4';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ available: 4000 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(budgetWithExpenseId);
      expect(budget.available).toEqual(4000);
    });

    it('should return 404 when budget does not exists on amount update', async () => {
      const budgetWithExpenseId = 'not-exists';
      await request(app)
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(StatusCodes.NOT_FOUND);
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
