import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import { Budget } from '../../Budget';
import { User } from '../../User';
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
    const owner = new User('123456', 'budget', 'owner', '', '');

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
        owner: {
          id: owner.id,
          name: 'budget owner',
        },
      };
    });

    async function findBudget() {
      const budgets = await budgetRepository.find(owner.id, []);
      return budgets.find((budget) => budget.name === budgetName);
    }

    describe('with only mandatory parameters', () => {
      beforeEach(async () => {
        await useCase.create(new Budget(budgetName, value, description), owner);
      });

      it('should create a new budget with default values', async () => {
        await expect(findBudget()).resolves.toEqual(expectedBudget);
      });
    });

    describe('with all parameters', () => {
      beforeEach(async () => {
        const type = 'RESERVE';
        const category = 'test';

        await useCase.create(new Budget(budgetName, value, description, type, category), owner);

        expectedBudget.category = category;
        expectedBudget.type = type;
      });

      it('should create a new budget with all values', async () => {
        await expect(findBudget()).resolves.toEqual(expectedBudget);
      });
    });
  });
});
