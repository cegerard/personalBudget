const uid = require('uid');

const budgetFixture = require('../fixtures/budgetFixture');

module.exports = class BudgetModelStub {
  static budgetStore = [];

  constructor(budget) {
    this.budget = budget;
  }

  static resetStore() {
    BudgetModelStub.budgetStore = JSON.parse(JSON.stringify(budgetFixture.list));
  }

  static find(selectedFields) {
    if (selectedFields.length === 0) {
      return Promise.resolve(BudgetModelStub.budgetStore);
    }

    const projectedBudgets = BudgetModelStub.budgetStore.map((budget) => {
      return selectedFields.reduce((acc, field) => {
        acc[field] = budget[field];
        return acc;
      }, {});
    });
    return Promise.resolve(projectedBudgets);
  }

  static findById(id, selectedFields) {
    const foundBudget = BudgetModelStub.budgetStore.find((budget) => budget._id === id);
    if (selectedFields.length === 0) {
      return Promise.resolve(foundBudget);
    }

    const projectedBudget = selectedFields.reduce((acc, field) => {
      acc[field] = foundBudget[field];
      return acc;
    }, {});
    return Promise.resolve(projectedBudget);
  }

  static remove(budgetFilter) {
    const budgetIndex = BudgetModelStub.budgetStore.findIndex((budget) => budget._id === budgetFilter._id);
    if (budgetIndex !== -1) {
      const deleted = BudgetModelStub.budgetStore.splice(budgetIndex, 1);
      return Promise.resolve({ deletedCount: deleted.length });
    }
    return Promise.resolve({ deletedCount: 0 });
  }

  static replaceOne(budgetFilter, newBudgetValue) {
    const budgetIndex = BudgetModelStub.budgetStore.findIndex((budget) => budget._id === budgetFilter._id);
    const budgetsReplaced = BudgetModelStub.budgetStore.splice(budgetIndex, 1, newBudgetValue);
    return Promise.resolve({ nModified: budgetsReplaced.length });
  }

  save() {
    this.budget._id = uid();
    BudgetModelStub.budgetStore.push(this.budget);
    return Promise.resolve(this.budget);
  }

};
