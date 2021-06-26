import { MongoBudgetRepository } from '../../../db/mongo';
import BudgetModelStub from '../../../test/stubs/BudgetModelStub';
import { Budget } from '../../Budget';
import CreateBudget from './CreateBudget';

describe('CreateBudget', () => {
  let useCase: CreateBudget;

  beforeAll(() => {
    const budgetRepository = new MongoBudgetRepository(BudgetModelStub);
    useCase = new CreateBudget(budgetRepository);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
  });

  describe('create', () => {
    it('should create a new budget with default values', async () => {
      const expectedBudget = {
        _id: expect.any(String),
        name: 'BudgetName',
        slug: 'budgetname',
        amount: 100,
        available: 100,
        description: 'budget description',
        expenses: [],
        type: 'NORMAL',
      };

      await useCase.create(
        new Budget(expectedBudget.name, expectedBudget.amount, expectedBudget.description)
      );
      const res = await BudgetModelStub.find(null, []);
      const storedBudget = (await BudgetModelStub.find(null, [])).find(
        (budget) => budget.name === 'BudgetName'
      );

      expect(storedBudget).toEqual(expectedBudget);
    });

    it('should create a new budget with all values', async () => {
      const expectedBudget = {
        _id: expect.any(String),
        name: 'BudgetName',
        slug: 'budgetname',
        amount: 100,
        available: 100,
        description: 'budget description',
        expenses: [],
        category: 'test',
        type: 'RESERVE',
      };

      await useCase.create(
        new Budget(
          expectedBudget.name,
          expectedBudget.amount,
          expectedBudget.description,
          'RESERVE',
          'test'
        )
      );
      const storedBudget = (await BudgetModelStub.find(null, [])).find(
        (budget) => budget.name === 'BudgetName'
      );

      expect(storedBudget).toEqual(expectedBudget);
    });
  });
});
