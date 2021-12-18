import uid from 'uid';
import { get } from 'lodash';

import expenseFixture from '../fixtures/expenseFixture';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';
import {
  deleteQuery,
  expenseQuery,
  lightExpense,
  patchableAttributes,
  readExpenseInfo,
  writeExpense,
} from '../../core/@types/expense/types';

const PATCHABLE_FIELDS = ['name', 'amount', 'date'];

export default class ExpenseRepositoryStub implements ExpenseRepository {
  private expenseStore: any[];

  constructor() {
    this.expenseStore = [];
  }

  public find(userId: string, query?: expenseQuery): Promise<readExpenseInfo[]> {
    const expenses = this.filterUserExpenses(userId);

    if (query) {
      const compareKeys = Object.keys(query);
      const filteredExpenses = expenses.filter((expense) => {
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

    return Promise.resolve(expenses);
  }

  public create(newExpense: writeExpense): Promise<lightExpense> {
    const expenseToCreate: any = Object.assign({}, newExpense);
    expenseToCreate._id = uid();
    this.expenseStore.push(expenseToCreate);
    return Promise.resolve(expenseToCreate);
  }

  public delete(userId: string, query: deleteQuery): Promise<boolean> {
    const compareKeys = Object.keys(query);
    let deletedExpenses = 0;

    this.expenseStore = this.expenseStore.filter((expense) => {
      if(userId !== expense.owner.id) {
        return true;
      }

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

    return Promise.resolve(deletedExpenses > 0);
  }

  public patch(userId: string, expenseId: string, attr: patchableAttributes): Promise<boolean> {
    const attributes: any = attr;
    const expenseIndex = this.expenseStore.findIndex((expense) => {
      return expense._id === expenseId && expense.owner.id === userId;
    });

    if (expenseIndex >= 0) {
      const expenseToUpdate = this.expenseStore[expenseIndex];

      PATCHABLE_FIELDS.forEach((key) => {
        const value = attributes[key];
        if (value !== undefined) {
          expenseToUpdate[key] = value;
        }
      });

      this.expenseStore[expenseIndex] = expenseToUpdate;
    }

    return Promise.resolve(expenseIndex >= 0);
  }

  public findById(id: string) {
    const foundExpense = this.expenseStore.find((budget) => budget._id === id);
    return Promise.resolve(foundExpense);
  }

  public resetStore() {
    this.expenseStore = JSON.parse(JSON.stringify(expenseFixture.list));
  }

  private filterUserExpenses(userId: string) {
    return this.expenseStore.filter((expense) => expense.owner.id === userId);
  }
}
