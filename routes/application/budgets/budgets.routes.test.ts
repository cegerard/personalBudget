import StatusCodes from 'http-status-codes';
import slugify from 'slugify';
import request from 'supertest';

import application from '../../../app';
import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from '../../../test/stubs/ExpenseRepositoryStub';
import { authenticate } from '../../../test/authHelper';

const budgetRepository = application.budgetRepository as BudgetRepositoryStub;
const expenseRepository = application.expenseRepository as ExpenseRepositoryStub;

let app: any = null;

describe('/budgets with authentication', () => {
  let userId = '0001';

  beforeEach(async () => {
    budgetRepository.resetStore();
    app = await authenticate(application.app);
  });

  describe('GET /budgets', () => {
    describe('when the user have budget lists', () => {
      it('should response with 200', async () => {
        await app.get('/budgets').expect(StatusCodes.OK);
      });
  
      it('should render the budgets list', async () => {
        await app.get('/budgets').then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
      });
    });

    describe('when the user does not have budget lists', () => {
      it('should response with 200', async () => {
        await app.get('/budgets').expect(StatusCodes.OK);
      });
  
      it('should render the budgets page without budgets', async () => {
        await app.get('/budgets').then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
      });
    });
  });

  describe('GET /budgets/:id', () => {
    const budgetId = 4;
    const budgetUrl = `/budgets/${budgetId}`;

    describe('when the user have a budget', () => {
      it('should response with 200', async () => {
        await app.get(budgetUrl).expect(StatusCodes.OK);
      });

      it('should render budget details page', async () => {
        await app.get(budgetUrl).then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
      });
    });

    describe('when the user does not have a budget', () => {

      beforeEach(() => {
        budgetRepository.clearStore();
      });

      it('should response with 404', async () => {
        await app.get(budgetUrl).expect(StatusCodes.NOT_FOUND);
      });
    })
  });

  describe('POST /budgets', () => {
    const newBudget = {
      name: 'budget Name',
      amount: 42,
      description: 'little description',
      category: 'cat',
    };

    it('should create a new budget line', async () => {
      await app
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send(newBudget)
        .expect(StatusCodes.OK);

      const budgets = await budgetRepository.find(userId);
      const budgetsFound = budgets.filter((budget: any) => {
        return budget.name === newBudget.name;
      });
      expect(budgetsFound.length).toEqual(1);
      expect(budgetsFound[0]).toEqual({
        _id: expect.any(String),
        name: newBudget.name,
        slug: slugify(newBudget.name, { lower: true }),
        amount: newBudget.amount,
        description: newBudget.description,
        available: newBudget.amount,
        expenses: [],
        category: 'cat',
        type: 'NORMAL',
        owner: {
          id: '0001',
          name: 'admin istrator',
        },
      });
    });
  });

  describe('DELETE /budgets', () => {
    it('should remove budget line and all its expenses', async () => {
      await app
        .delete('/budgets/4')
        .expect(StatusCodes.NO_CONTENT)
        .then(async () => {
          const allBudgets = await budgetRepository.find(userId);
          const budgetNotFound = allBudgets.find((budget: any) => {
            return budget._id === '4';
          });

          expect(budgetNotFound).toBeUndefined();

          const allExpenses = await expenseRepository.find(userId);
          const expensesFound = allExpenses.filter((expense: any) => {
            return expense.budgetLine._id === '4';
          });

          expect(expensesFound.length).toEqual(0);
        });
    });

    it('should return a 404 error when the budget can not be deleted', async () => {
      await app.delete('/budgets/404').expect(404);
    });
  });

  describe('POST /budgets/:id', () => {
    const budgetId = '5';

    let budgetBeforeUpdate: any;

    beforeEach(async () => {
      budgetBeforeUpdate = await budgetRepository.findOneById(userId, budgetId);
      delete budgetBeforeUpdate.name;
    });

    it.each([
      ['name', 'new name'],
      ['amount', 42],
      ['description', 'the description'],
      ['category', 'cat'],
    ])('should update the budget %s', async (field, value) => {
      await app
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ [field]: value })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(userId, budgetId);
      expect(budget[field]).toEqual(value);
    });

    it('should not update other budget attributes', async () => {
      await app
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(userId, budgetId);
      delete budget.name;
      expect(budget).toEqual(budgetBeforeUpdate);
    });

    it('should not add attributes not define in schema', async () => {
      await app
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name', notexist: 'should not add', dont: 'aie' })
        .expect(StatusCodes.OK);

      const budget: any = await budgetRepository.findOneById(userId, budgetId);
      expect(budget.notexist).toBeUndefined();
      expect(budget.dont).toBeUndefined();
    });

    it('should update the slug with the name', async () => {
      await app
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'new name' })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(userId, budgetId);
      expect(budget.slug).toEqual('new-name');
    });

    it('should update the available value when amount is updated', async () => {
      await app
        .post(`/budgets/${budgetId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 666 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(userId, budgetId);
      expect(budget.available).toEqual(666);
    });

    it('should update the available value with expenses', async () => {
      const budgetWithExpenseId = '4';
      await app
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(userId, budgetWithExpenseId);
      expect(budget.available).toEqual(29);
    });

    it('should set the available value when passed as parameters', async () => {
      const budgetWithExpenseId = '4';
      await app
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ available: 4000 })
        .expect(StatusCodes.OK);

      const budget = await budgetRepository.findOneById(userId, budgetWithExpenseId);
      expect(budget.available).toEqual(4000);
    });

    it('should return 404 when budget does not exists on amount update', async () => {
      const budgetWithExpenseId = 'not-exists';
      await app
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .expect(StatusCodes.NOT_FOUND);
    });

    it('should render budget details page', async () => {
      const budgetWithExpenseId = '4';
      await app
        .post(`/budgets/${budgetWithExpenseId}`)
        .set('Content-Type', 'application/json')
        .send({ amount: 100 })
        .then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });
});

describe('/budget without authentication', () => {
  beforeEach(() => {
    app = request(application.app);
  });

  describe('GET /budgets', () => {
    it('should response with 401', async () => {
      await app.get('/budgets').expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should render home page', async () => {
      await app.get('/budgets').then((res: any) => {
        expect(res.text).toMatchSnapshot();
      });
    });
  });

  describe('GET /budgets/:id', () => {
    const budgetId = 4;
    const budgetUrl = `/budgets/${budgetId}`;

    it('should response with 302', async () => {
      await app.get(budgetUrl).expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should render home page', async () => {
      await app.get(budgetUrl).then((res: any) => {
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

    it('should not create a new budget line', async () => {
      await app
        .post('/budgets')
        .set('Content-Type', 'application/json')
        .send(newBudget)
        .expect(StatusCodes.MOVED_TEMPORARILY);

      const budgets = await budgetRepository.find('0001');
      const budgetsFound = budgets.filter((budget: any) => {
        return budget.name === newBudget.name;
      });
      expect(budgetsFound.length).toEqual(0);
    });
  });

  describe('DELETE /budgets', () => {
    it('should return unauthorized', async () => {
      await app.delete('/budgets/4').expect(StatusCodes.MOVED_TEMPORARILY);
    });
  });

  describe('POST /budgets/:id', () => {
    it('should return unauthorized', async () => {
      await app
        .post('/budgets/5')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(StatusCodes.MOVED_TEMPORARILY);
    });
  });
});
