import uid from 'uid';
import { get } from 'lodash';

import expenseFixture from '../fixtures/expenseFixture';

const PATCHABLE_FIELDS = ['name', 'amount', 'date'];

export default class ExpenseModelStub {
  static expenseStore: any[] = [];

  private expense: any;

  constructor(expense: any) {
    this.expense = expense;
  }

  static resetStore() {
    ExpenseModelStub.expenseStore = JSON.parse(JSON.stringify(expenseFixture.list));
  }

  static find(query: any) {
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

  static findById(id: string) {
    const foundExpense = ExpenseModelStub.expenseStore.find((budget) => budget._id === id);
    return Promise.resolve(foundExpense);
  }

  static remove(query: any) {
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

  static updateOne(expenseFilter: any, attributes: any) {
    const expenseIndex = ExpenseModelStub.expenseStore.findIndex(
      (expense) => expense._id === expenseFilter._id
    );

    if (expenseIndex >= 0) {
      const expenseToUpdate = ExpenseModelStub.expenseStore[expenseIndex];

      PATCHABLE_FIELDS.forEach((key) => {
        const value = attributes[key];
        if (value !== undefined) {
          expenseToUpdate[key] = value;
        }
      });

      ExpenseModelStub.expenseStore[expenseIndex] = expenseToUpdate;
    }

    return Promise.resolve({ n: expenseIndex >= 0 ? 1 : 0 });
  }

  save() {
    this.expense._id = uid();
    ExpenseModelStub.expenseStore.push(this.expense);
    return Promise.resolve(this.expense);
  }
}