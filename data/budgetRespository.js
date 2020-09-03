const slugify = require('slugify');
const { uid } = require('uid');
const budgetListSeed = require('./budgetList.json'); // TODO replace this by core service layer when available

class BudgetRepository {
  constructor() {
    this.budgetList = budgetListSeed;
  }

  get budgets() {
    return this.budgetList;
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
      return this.budgetList.splice(budgetIndex, 1);
    }
    return null;
  }
}

module.exports = new BudgetRepository();
