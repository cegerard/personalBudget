const slugify = require('slugify');
const uid = require('uid');
const budgetListSeed = require('./budgetList.json'); // TODO replace this by core service layer when available

class BudgetRepository {
  constructor() {
    this.budgetList = budgetListSeed;
  }

  get budgets() {
    return this.budgetList;
  }

  get simpleBudgets() {
    return this.budgetList.map((budget) => ({ id: budget.id, name: budget.name }));
  }

  add(budget) {
    return this.budgetList.push({
      id: uid(),
      name: budget.name,
      slug: slugify(budget.name),
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
    });
  }

  delete(budgetId) {
    const budgetIndex = this.budgetList.findIndex((budget) => budget.id === budgetId);
    if (budgetIndex !== -1) {
      return this.budgetList.splice(budgetIndex, 1)[0];
    }
    return null;
  }

  getSimpleBudget(budgetId) {
    const foundBudget = this.budgetList.find((budget) => budget.id === budgetId);
    // TODO handle error when budgetLine is not found
    return {
      id: foundBudget.id,
      name: foundBudget.name,
    };
  }

  addExpenseToBudget(budgetId, expense) {
    const foundBudget = this.budgetList.find((budget) => budget.id === budgetId);
    // TODO handle error when budgetLine is not found
    foundBudget.expenses.push(expense);
    // compute available field
    foundBudget.available -= expense.amount;
  }

  removeExpenseFromBudget(budgetId, expenseId) {
    const foundBudget = this.budgetList.find((budget) => budget.id === budgetId);
    // TODO handle error when budgetLine is not found
    const expenseIndex = foundBudget.expenses.findIndex((expense) => expense.id === expenseId);
    if (expenseIndex !== -1) {
      return foundBudget.expenses.splice(expenseIndex, 1)[0];
    }
    return null;
  }
}

module.exports = new BudgetRepository();