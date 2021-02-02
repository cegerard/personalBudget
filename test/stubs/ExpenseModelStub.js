const uid = require('uid');
const { get } = require('lodash');

const expenseFixture = require('../fixtures/expenseFixture');

const PATCHABLE_FIELDS = ['name', 'amount', 'date'];

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
      const compareKeys = Object.keys(query);
      const filteredExpenses = ExpenseModelStub.expenseStore.filter((expense) => {
        let keepExpense = true;
        compareKeys.forEach((key) => {
          if (get(expense, key) !== get(query, key)) {
            keepExpense = false;
          }
        });
        return keepExpense;
      });
      return Promise.resolve(filteredExpenses);
    }
    return Promise.resolve(ExpenseModelStub.expenseStore);
  }

  static findById(id, selectedFields) {
    const foundBudget = ExpenseModelStub.expenseStore.find((budget) => budget._id === id);
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

  static patch(expenseFilter, attributes) {
    const expenseIndex = ExpenseModelStub.expenseStore.findIndex((expense) => expense._id === expenseFilter._id);

    if(expenseIndex >= 0) {
      const expenseToUpdate = ExpenseModelStub.expenseStore[expenseIndex];
  
      PATCHABLE_FIELDS.forEach(key => {
        const value = attributes[key];
        if(value !== undefined) {
          expenseToUpdate[key] = value;
        }
      });
  
      ExpenseModelStub.expenseStore[expenseIndex] = expenseToUpdate;
    }
    
    return Promise.resolve({ n: expenseIndex >= 0 ? 1 : 0});
  }

  save() {
    this.expense._id = uid();
    ExpenseModelStub.expenseStore.push(this.expense);
    return Promise.resolve(this.expense);
  }
};
