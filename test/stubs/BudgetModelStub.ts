import uid from 'uid';
import budgetFixture from '../fixtures/budgetFixture';

const PATCHABLE_FIELDS = ['name', 'slug', 'amount', 'available', 'description', 'category', 'type'];

export default class BudgetModelStub {
  static budgetStore: any[] = [];

  private budget: any;

  constructor(budget: any) {
    this.budget = {
      ...budget,
      amount: Number(budget.amount),
      available: Number(budget.available),
    };
  }

  static resetStore() {
    BudgetModelStub.budgetStore = JSON.parse(JSON.stringify(budgetFixture.list));
  }

  static find(_: any, selectedFields: string[]) {
    if (selectedFields.length === 0) {
      return Promise.resolve(BudgetModelStub.budgetStore);
    }

    const projectedBudgets = BudgetModelStub.budgetStore.map((budget) => {
      return selectedFields.reduce((acc: any, field) => {
        acc[field] = budget[field];
        return acc;
      }, {});
    });
    return Promise.resolve(projectedBudgets);
  }

  static findById(id: string, selectedFields: string[]) {
    const foundBudget = BudgetModelStub.budgetStore.find((budget) => budget._id === id);
    if (selectedFields.length === 0) {
      return Promise.resolve(foundBudget);
    }

    const projectedBudget = selectedFields.reduce((acc: any, field) => {
      acc[field] = foundBudget[field];
      return acc;
    }, {});
    return Promise.resolve(projectedBudget);
  }

  static remove(budgetFilter: any) {
    const budgetIndex = BudgetModelStub.budgetStore.findIndex(
      (budget) => budget._id === budgetFilter._id
    );
    if (budgetIndex !== -1) {
      const deleted = BudgetModelStub.budgetStore.splice(budgetIndex, 1);
      return Promise.resolve({ deletedCount: deleted.length });
    }
    return Promise.resolve({ deletedCount: 0 });
  }

  static replaceOne(budgetFilter: any, newBudgetValue: any) {
    const budgetIndex = BudgetModelStub.budgetStore.findIndex(
      (budget) => budget._id === budgetFilter._id
    );
    const budgetsReplaced = BudgetModelStub.budgetStore.splice(budgetIndex, 1, newBudgetValue);
    return Promise.resolve({ nModified: budgetsReplaced.length });
  }

  static updateOne(budgetFilter: any, attributes: any) {
    const budgetIndex = BudgetModelStub.budgetStore.findIndex(
      (budget) => budget._id === budgetFilter._id
    );

    if (budgetIndex >= 0) {
      const budgetToUpdate = BudgetModelStub.budgetStore[budgetIndex];

      PATCHABLE_FIELDS.forEach((key) => {
        const value = attributes[key];
        if (value !== undefined) {
          budgetToUpdate[key] = value;
        }
      });

      BudgetModelStub.budgetStore[budgetIndex] = budgetToUpdate;
    }

    return Promise.resolve({ n: budgetIndex >= 0 ? 1 : 0 });
  }

  save() {
    this.budget._id = uid();
    BudgetModelStub.budgetStore.push(this.budget);
    return Promise.resolve(this.budget);
  }
}
