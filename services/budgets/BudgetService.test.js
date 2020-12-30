const BudgetRepository = require('../../data').BudgetRepository;
const budgetFixture = require('../../test/fixtures/budgetFixture');
const BudgetModelStub = require('../../test/stubs/BudgetModelStub');
const BudgetService = require('./BudgetService');

describe('BudgetService', () => {
  const SECOND_BUDGET_ID = '2';
  const FOURTH_BUDGET_ID = '4';

  let budgetService;

  beforeAll(() => {
    const budgetRepository = new BudgetRepository(BudgetModelStub);
    budgetService = new BudgetService(budgetRepository);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
  });

  describe('list', () => {
    it('should return the list of budgets', async () => {
      const list = await budgetService.list();
      expect(list).toEqual(budgetFixture.list);
    });

    it('should return the list of projected budget fields', async () => {
      const expectedBudgetList = budgetFixture.list.map((budget) => {
        return {
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
        };
      });
      const list = await budgetService.list(['id', 'name', 'amount']);
      expect(list).toEqual(expectedBudgetList);
    });
  });

  describe('getById', () => {
    it('should return a budget from its id', async () => {
      const budget = await budgetService.getById(SECOND_BUDGET_ID);
      expect(budget).toEqual(budgetFixture.list[1]);
    });
    
    it('should return a projected budget from its id with fields projection', async () => {
      const expectedProjectedBudget = {
        description: budgetFixture.list[1].description,
        name: budgetFixture.list[1].name,
        amount: budgetFixture.list[1].amount,
      };
      
      const budget = await budgetService.getById(SECOND_BUDGET_ID, [
        'name',
        'amount',
        'description',
      ]);
      
      expect(budget).toEqual(expectedProjectedBudget);
    });
  });

  describe('create', () => {
    it('should create a new budget', async () => {
      const expectedBudget = {
        id: expect.any(String),
        name: 'budgetName',
        slug: 'budgetName',
        amount: 100,
        available: 100,
        description: 'budget description',
        expenses: []
      }

      const budget = await budgetService.create({
        name: expectedBudget.name,
        amount: expectedBudget.amount,
        description: expectedBudget.description
      });
      const storedBudget = await BudgetModelStub.findById(budget.id, []);

      expect(budget).toEqual(expectedBudget);
      expect(storedBudget).toEqual(expectedBudget)
    });
  });

  describe('remove', () => {
    it('should remove an existing budget', async () => {
      const isDeleted = await budgetService.remove(SECOND_BUDGET_ID);
      
      expect(isDeleted).toEqual(true);
    });

    it('should do nothing fr a non existing budget', async () => {
      const isDeleted = await budgetService.remove('unkown');
      
      expect(isDeleted).toEqual(false);
    });
  });

  describe('addExpense', () => {
    const newExpense = {
      id: '42',
      name: 'new expense',
      amount: 42,
      date: '2020-12-29'
    };

    it('should return that the expense has been replaced', async () => {
      const isReplaced = await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      expect(isReplaced).toEqual(true);
    });

    it('should add a the expense to the budget expense array', async () => {
      await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(3);
      expect(updatedBudget.expenses[2]).toEqual(newExpense);
    });

    it('should update the budget available field', async () => {
      await budgetService.addExpense(FOURTH_BUDGET_ID, newExpense);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(37);
    });
  });

  describe('removeExpense', () => {
    const expenseId = '100';

    it('should return that the expense has been removed', async () => {
      const isRemoved = await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      expect(isRemoved).toEqual(true);
    });

    it('should remove the expense from the expenses array', async () => {
      await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.expenses.length).toEqual(1);
      expect(updatedBudget.expenses[0].id).toEqual('101');
    });

    it('should update the available field', async () => {
      await budgetService.removeExpense(FOURTH_BUDGET_ID, expenseId);
      const updatedBudget = await BudgetModelStub.findById(FOURTH_BUDGET_ID, []);

      expect(updatedBudget.available).toEqual(120);
    });
  });
});
