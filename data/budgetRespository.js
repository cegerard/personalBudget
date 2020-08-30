const slugify = require('slugify');
const budgetListSeed = require('./budgetList.json'); // TODO replace this by core service layer when available

class BudgetRepository {
  constructor() {
    this.budgetList = budgetListSeed;
  }

  get budgets() {
    return this.budgetList;
  }

  add(budgetList) {
    this.budgetList.push({
      name: budgetList.name,
      slug: slugify(budgetList.name),
      amount: budgetList.amount,
      description: budgetList.description,
      available: budgetList.amount,
      expenses: [],
    });
  }
}

module.exports = new BudgetRepository();
