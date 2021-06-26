import MongoBudgetRepository from './MongoBudgetRespository';
import budgetFixture from '../../../test/fixtures/budgetFixture';
import BudgetModelStub from '../../../test/stubs/BudgetModelStub';

describe('MongoBudgetRepository', () => {
  const SECOND_BUDGET_ID = '2';
  let budgetRepository = new MongoBudgetRepository(BudgetModelStub);

  beforeEach(() => {
    BudgetModelStub.resetStore();
  });

  describe('find', () => {
    it('should return the list of budgets', async () => {
      const list = await budgetRepository.find([]);
      expect(list).toEqual(budgetFixture.list);
    });

    it('should return the list of projected budget fields', async () => {
      const expectedBudgetList = budgetFixture.list.map((budget) => {
        return {
          _id: budget._id,
          name: budget.name,
          amount: budget.amount,
        };
      });
      const list = await budgetRepository.find(['_id', 'name', 'amount']);
      expect(list).toEqual(expectedBudgetList);
    });
  });

  describe('findOneById', () => {
    it('should return a budget from its id', async () => {
      const budget = await budgetRepository.findOneById(SECOND_BUDGET_ID, []);
      expect(budget).toEqual(budgetFixture.list[1]);
    });

    it('should return a projected budget from its id with fields projection', async () => {
      const expectedProjectedBudget = {
        description: budgetFixture.list[1].description,
        name: budgetFixture.list[1].name,
        amount: budgetFixture.list[1].amount,
      };

      const budget = await budgetRepository.findOneById(SECOND_BUDGET_ID, [
        'name',
        'amount',
        'description',
      ]);

      expect(budget).toEqual(expectedProjectedBudget);
    });
  });
});
