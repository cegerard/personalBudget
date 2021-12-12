import BudgetRepositoryStub from '../../../test/stubs/BudgetRepositoryStub';
import { renewResponse } from '../../@types/budget/types';
import RenewBudgets from './RenewBudgets';

describe('RenewBudget', () => {
  let budgetRepository: BudgetRepositoryStub;
  let useCase: RenewBudgets;

  beforeEach(() => {
    budgetRepository = new BudgetRepositoryStub();
    useCase = new RenewBudgets(budgetRepository);
  });

  describe('with existing budgets', () => {
    beforeEach(() => {
      budgetRepository.resetStore();
    });

    it('renews all budgets', async () => {
      const expectedResponse: renewResponse = {
        status: 'SUCCESS',
        renewedSuccess: [
          {
            _id: '1',
            name: 'Electricité',
          },
          {
            _id: '2',
            name: 'Crédit voiture',
          },
          {
            _id: '3',
            name: 'Crédit immobilier',
          },
          {
            _id: '4',
            name: 'Essence',
          },
          {
            _id: '5',
            name: 'Assurance voiture',
          },
          {
            _id: '6',
            name: 'Alimentation',
          },
          {
            _id: '7',
            name: 'Animaux',
          },
          {
            _id: '8',
            name: 'Enfants',
          },
        ],
        renewedFaillure: [],
      };

      await expect(useCase.renewAll()).resolves.toEqual(expectedResponse);
    });

    it('update the available field of the budget 4', async () => {
      await useCase.renewAll();
      const updatedBudget = await budgetRepository.getById('4');

      expect(updatedBudget.available).toEqual(150);
    });

    it('clear expenses from budget 4', async () => {
      await useCase.renewAll();
      const updatedBudget = await budgetRepository.getById('4');

      expect(updatedBudget.expenses).toEqual([]);
    });

    describe('with RESERVE budget', () => {
      beforeEach(async () => {
        await budgetRepository.create({
          name: 'reserve',
          slug: 'reserve',
          amount: 50,
          type: 'RESERVE',
          description: 'test reserve budget',
          owner: {
            id: '123',
            name: 'renew test',
          },
        });
      });

      it('increments the available field of the reserved budget', async () => {
        await useCase.renewAll();
        const budgets = await budgetRepository.findAll();
        const reservedBudget = budgets.find((budget) => {
          return budget.name === 'reserve';
        });

        expect(reservedBudget?.available).toEqual(100);
      });
    });

    describe('with budget update failure', () => {
      it('returns failure status', async () => {
        budgetRepository.patch = (budgetId, attr) => {
          return Promise.resolve(false);
        };

        const expectedResponse: renewResponse = {
          status: 'FAILURE',
          renewedSuccess: [],
          renewedFaillure: [
            {
              _id: '1',
              name: 'Electricité',
            },
            {
              _id: '2',
              name: 'Crédit voiture',
            },
            {
              _id: '3',
              name: 'Crédit immobilier',
            },
            {
              _id: '4',
              name: 'Essence',
            },
            {
              _id: '5',
              name: 'Assurance voiture',
            },
            {
              _id: '6',
              name: 'Alimentation',
            },
            {
              _id: '7',
              name: 'Animaux',
            },
            {
              _id: '8',
              name: 'Enfants',
            },
          ],
        };

        await expect(useCase.renewAll()).resolves.toEqual(expectedResponse);
      });
    });
  });

  describe('without budgets', () => {
    it('does nothing', async () => {
      const expectedResponse: renewResponse = {
        status: 'SUCCESS',
        renewedSuccess: [],
        renewedFaillure: [],
      };

      await expect(useCase.renewAll()).resolves.toEqual(expectedResponse);
    });
  });
});
