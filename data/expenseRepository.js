const uid = require('uid');
const expenseListSeed = require('./expenseList.json'); // TODO replace this by core service layer when available

class ExpenseRepository {
  constructor() {
    this.expenseList = expenseListSeed;
  }

  get expenses() {
    return this.expenseList;
  }

  add(expense) {
    this.expenseList.push({
      id: uid(),
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      budgetLine: expense.budgetLine,
    });
  }

  delete(expenseId) {
    const expenseIndex = this.expenseList.findIndex((expense) => expense.id === expenseId);
    if (expenseIndex !== -1) {
      return this.expenseList.splice(expenseIndex, 1);
    }
    return null;
  }
}

module.exports = new ExpenseRepository();
