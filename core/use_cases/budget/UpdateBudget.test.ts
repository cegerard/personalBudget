import { MongoBudgetRepository } from '../../../db/mongo';
import BudgetModelStub from '../../../test/stubs/BudgetModelStub';
import { budgetType } from '../../@types/budget/types';
import UpdateBudget from './UpdateBudget';

describe('UpdateBudget', () => {
  let budgetRepository: MongoBudgetRepository;

  beforeAll(() => {
    budgetRepository = new MongoBudgetRepository(BudgetModelStub);
  });

  beforeEach(() => {
    BudgetModelStub.resetStore();
  });

  describe('patch', () => {
    let useCase: UpdateBudget;

    describe('when the budget exists', () => {
      const budget_id = '7';

      beforeEach(() => {
        useCase = new UpdateBudget(budget_id, budgetRepository);
      });

      it('should update field for an existing budget', async () => {
        const expectedBudget = {
          _id: budget_id,
          name: 'Rename',
          slug: 'rename',
          amount: 30,
          available: 30,
          description: 'it has been updated',
          category: 'add cat',
          expenses: [],
          type: 'RESERVE',
        };

        await useCase.patch({
          name: expectedBudget.name,
          amount: expectedBudget.amount,
          description: expectedBudget.description,
          category: expectedBudget.category,
          type: expectedBudget.type as budgetType,
        });

        const updatedBudget = await BudgetModelStub.findById(budget_id, []);
        expect(updatedBudget).toEqual(expectedBudget);
      });

      it('should return true on update', async () => {
        const res = await useCase.patch({ description: 'test' });

        expect(res).toBe(true);
      });
    });

    describe('when the budget does not exist', () => {
      beforeEach(() => {
        useCase = new UpdateBudget('unknown', budgetRepository);
      });

      describe('when the amount is not modified', () => {
        it('should return false when update failed', async () => {
          const res = await useCase.patch({ name: 'test' });

          expect(res).toBe(false);
        });
      });

      describe('when the amount is modified and available is not', () => {
        it('should return false', async () => {
          const res = await useCase.patch({ amount: 32 });

          expect(res).toBe(false);
        });
      });
    });
  });
});
