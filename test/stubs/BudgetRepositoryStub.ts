import uid from 'uid';
import budgetFixture from '../fixtures/budgetFixture';
import {
  readBudgetInfo,
  readBudgetComplete,
  writeBudget,
  attributesToPatch,
  writeBudgetComplete,
} from '../../core/@types/budget/types';
import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';

const PATCHABLE_FIELDS = ['name', 'slug', 'amount', 'available', 'description', 'category', 'type'];

export default class BudgetRepositoryStub implements BudgetRepository {
  private budgetStore: any[];

  constructor() {
    this.budgetStore = [];
  }

  public find(selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    if (selectedFields.length === 0) {
      return Promise.resolve(this.budgetStore);
    }

    const projectedBudgets = this.budgetStore.map((budget) => {
      return selectedFields.reduce((acc: any, field) => {
        acc[field] = budget[field];
        return acc;
      }, {});
    });
    return Promise.resolve(projectedBudgets);
  }

  public findOneById(budgetId: string, selectedFields: string[] = []): Promise<readBudgetComplete> {
    const foundBudget = this.budgetStore.find((budget) => budget._id === budgetId);
    if (selectedFields.length === 0) {
      return Promise.resolve(foundBudget);
    }

    const projectedBudget = selectedFields.reduce((acc: any, field) => {
      acc[field] = foundBudget[field];
      return acc;
    }, {});
    return Promise.resolve(projectedBudget);
  }

  public create(newBudget: writeBudget): Promise<void> {
    const budgetToCreate: any = Object.assign({}, newBudget);
    budgetToCreate._id = uid();
    budgetToCreate.available = newBudget.amount;
    budgetToCreate.expenses = [];

    this.budgetStore.push(budgetToCreate);
    return Promise.resolve();
  }

  public delete(budgetId: string): Promise<boolean> {
    const budgetIndex = this.budgetStore.findIndex(
      (budget) => budget._id === budgetId
    );

    let deletedCount = 0;

    if (budgetIndex !== -1) {
      const deleted = this.budgetStore.splice(budgetIndex, 1);
      deletedCount = deleted.length;
    }

    return Promise.resolve(deletedCount === 1);
  }
  
  public patch(budgetId: string, attr: attributesToPatch): Promise<boolean> {
    const attributes: any = attr;
    const budgetIndex = this.budgetStore.findIndex(
      (budget) => budget._id === budgetId
    );

    if (budgetIndex >= 0) {
      const budgetToUpdate = this.budgetStore[budgetIndex];

      PATCHABLE_FIELDS.forEach((key) => {
        const value: any = attributes[key];
        if (value !== undefined) {
          budgetToUpdate[key] = value;
        }
      });

      this.budgetStore[budgetIndex] = budgetToUpdate;
    }

    return Promise.resolve(budgetIndex >= 0);
  }

  public update(writeBudget: writeBudgetComplete): Promise<boolean> {
    const budgetIndex = this.budgetStore.findIndex(
      (budget) => budget._id === writeBudget._id
    );
    
    const budgetsReplaced = this.budgetStore.splice(budgetIndex, 1, writeBudget);
    return Promise.resolve(budgetsReplaced.length === 1);
  }

  public resetStore() {
    this.budgetStore = JSON.parse(JSON.stringify(budgetFixture.list));
  }

}
