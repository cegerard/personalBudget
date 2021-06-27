import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import { Budget } from '../../Budget';
import CreateBudget from './CreateBudget';

describe('CreateBudget', () => {
  let useCase: CreateBudget;
  let budgetRepository: BudgetRepositoryStub;

  beforeAll(() => {
    budgetRepository = new BudgetRepositoryStub();
    useCase = new CreateBudget(budgetRepository);
  });

  beforeEach(() => {
    budgetRepository.resetStore();
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
      const res = await budgetRepository.find([]);
      const storedBudget = (await budgetRepository.find([])).find(
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
      const storedBudget = (await budgetRepository.find([])).find(
        (budget) => budget.name === 'BudgetName'
      );

      expect(storedBudget).toEqual(expectedBudget);
    });
  });
});
