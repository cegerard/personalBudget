const uid = require('uid');
const expenseListSeed = require('./expenseList.json'); // TODO replace this by core service layer when available

class ExpenseRepository {
  constructor() {
    this.expenseList = expenseListSeed;
  }

  get expenses() {
    return this.expenseList;
  }

  getForBudgetLineName(budgetLineName) {
    return this.expenseList.filter((expense) => expense.budgetLine.name === budgetLineName);
  }

  add(expense) {
    const generatedId = uid();
    this.expenseList.push({
      id: generatedId,
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      budgetLine: expense.budgetLine,
    });
    return generatedId;
  }

  delete(expenseId) {
    const expenseIndex = this.expenseList.findIndex((expense) => expense.id === expenseId);
    if (expenseIndex !== -1) {
      return this.expenseList.splice(expenseIndex, 1)[0];
    }
    return null;
  }

  removeAllFromBudget(budgetId) {
    const expensesToRemove = this.expenseList.filter(
      (expense) => expense.budgetLine.id === budgetId,
    );
    const errors = [];
    expensesToRemove.forEach((expense) => {
      if (this.delete(expense.id) === null) {
        errors.push({
          expenseId: expense.id,
          message: 'Not Found',
        });
      }
    });

    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Expenses deletion errors: ', errors);
      return null;
    }

    return expensesToRemove.length;
  }
}

module.exports = new ExpenseRepository();
