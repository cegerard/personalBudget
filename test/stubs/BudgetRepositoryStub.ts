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

const PATCHABLE_FIELDS = [
  'name',
  'slug',
  'amount',
  'available',
  'description',
  'category',
  'type',
  'expenses',
];

export default class BudgetRepositoryStub implements BudgetRepository {
  private budgetStore: any[];

  constructor() {
    this.budgetStore = [];
  }

  public find(userId: string, selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    const budgets = this.filterUserBudgets(userId);

    if (selectedFields.length === 0) {
      return Promise.resolve(budgets);
    }

    const projectedBudgets = budgets.map((budget) => {
      return selectedFields.reduce((acc: any, field) => {
        acc[field] = budget[field];
        return acc;
      }, {});
    });
    return Promise.resolve(projectedBudgets);
  }

  public findAll(selectedFields: string[] = []): Promise<readBudgetInfo[]> {
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

  public findOneById(userId: string, budgetId: string): Promise<readBudgetComplete> {
    const budgets = this.filterUserBudgets(userId);

    const foundBudget = budgets.find((budget) => budget._id === budgetId);
    return Promise.resolve(foundBudget);
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
    const budgetIndex = this.budgetStore.findIndex((budget) => budget._id === budgetId);
    
    let deletedCount = 0;
    
    if (budgetIndex !== -1) {
      const deleted = this.budgetStore.splice(budgetIndex, 1);
      deletedCount = deleted.length;
    }

    return Promise.resolve(deletedCount === 1);
  }
  
  public patch(budgetId: string, attr: attributesToPatch): Promise<boolean> {
    const attributes: any = attr;
    const budgetIndex = this.budgetStore.findIndex((budget) => budget._id === budgetId);

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
    const budgetIndex = this.budgetStore.findIndex((budget) => budget._id === writeBudget._id);

    const budgetsReplaced = this.budgetStore.splice(budgetIndex, 1, writeBudget);
    return Promise.resolve(budgetsReplaced.length === 1);
  }
  
  public getById(budgetId: string): Promise<readBudgetComplete> {
    const budget = this.budgetStore.find((budget) => budget._id === budgetId);
    return Promise.resolve(budget);
  }

  public resetStore() {
    this.budgetStore = JSON.parse(JSON.stringify(budgetFixture.list));
  }

  public clearStore() {
    this.budgetStore = [];
  }

  private filterUserBudgets(userId: string) {
    return this.budgetStore.filter((budget) => budget.owner.id === userId);
  }
}
