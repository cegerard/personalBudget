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
    const budgetName = 'BudgetName';
    const budgetSlug = 'budgetname';
    const value = 100;
    const description = 'budget description';

    let expectedBudget: any;

    beforeEach(() => {
      expectedBudget = {
        _id: expect.any(String),
        name: budgetName,
        slug: budgetSlug,
        amount: value,
        available: value,
        description: description,
        expenses: [],
        type: 'NORMAL',
      };
    });

    async function findBudget() {
      const budgets = await budgetRepository.find([]);
      return budgets.find((budget) => budget.name === budgetName);
    }

    describe('with only mandatory parameters', () => {
      beforeEach(async () => {
        await useCase.create(new Budget(budgetName, value, description));
      });

      it('should create a new budget with default values', async () => {
        expect(findBudget()).resolves.toEqual(expectedBudget);
      });
    });

    describe('with all parameters', () => {
      beforeEach(async () => {
        const type = 'RESERVE';
        const category = 'test';

        await useCase.create(new Budget(budgetName, value, description, type, category));

        expectedBudget.category = category;
        expectedBudget.type = type;
      });

      it('should create a new budget with all values', async () => {
        expect(findBudget()).resolves.toEqual(expectedBudget);
      });
    });
  });
});

