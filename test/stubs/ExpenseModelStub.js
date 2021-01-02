const uid = require('uid');
const { get } = require('lodash');

const expenseFixture = require('../fixtures/expenseFixture');

module.exports = class ExpenseModelStub {
  static expenseStore = [];

  constructor(expense) {
    this.expense = expense;
  }

  static resetStore() {
    ExpenseModelStub.expenseStore = JSON.parse(JSON.stringify(expenseFixture.list));
  }

  static find(query) {
    if (query) {
      return Promise.resolve(
        ExpenseModelStub.expenseStore.filter(
          (expense) => expense.budgetLine.name === get(query, 'budgetLine.name')
        )
      );
    }
    return Promise.resolve(ExpenseModelStub.expenseStore);
  }

  static findById(id, selectedFields) {
    const foundBudget = ExpenseModelStub.expenseStore.find((budget) => budget.id === id);
    if (selectedFields.length === 0) {
      return Promise.resolve(foundBudget);
    }

    const projectedBudget = selectedFields.reduce((acc, field) => {
      acc[field] = foundBudget[field];
      return acc;
    }, {});
    return Promise.resolve(projectedBudget);
  }

  static remove(query = {}) {
    const compareKeys = Object.keys(query);
    let deletedExpenses = 0;

    ExpenseModelStub.expenseStore = ExpenseModelStub.expenseStore.filter((expense) => {
      let keepExpense = false;
      compareKeys.forEach((key) => {
        if (get(expense, key) !== get(query, key)) {
          keepExpense = true;
        }
      });
      if (!keepExpense) {
        deletedExpenses++;
      }
      return keepExpense;
    });

    return Promise.resolve({ deletedCount: deletedExpenses });
  }

  save() {
    this.expense.id = uid();
    ExpenseModelStub.expenseStore.push(this.expense);
    return Promise.resolve(this.expense);
  }
};
