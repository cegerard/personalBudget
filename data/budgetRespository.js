const slugify = require('slugify');
const uid = require('uid');
const budgetListSeed = require('./budgetList.json'); // TODO replace this by core service layer when available

class BudgetRepository {
  constructor() {
    this.budgetList = budgetListSeed;
  }

  find(selectedFields = []) {
    if(selectedFields.length === 0) {
      return this.budgetList;
    }
    // TODO validate fields parameters
    return this.budgetList.map((budget) => {
      return selectedFields.reduce((acc, field) => {
        acc[field] = budget[field];
        return acc;
      }, {});
    });
  }

  findOneById(budgetId, selectedFields = []) {
    const foundBudget = this.budgetList.find((budget) => budget.id === budgetId);
    if (selectedFields.length === 0) {
      return foundBudget;
    }
    // TODO validate fields parameters
    return selectedFields.reduce((acc, field) => {
      acc[field] = foundBudget[field];
      return acc;
    }, {});
  }

  create(budget) {
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

  update(budgetToUpdate) {
    const budgetIndex = this.budgetList.findIndex((budget) => budget.id === budgetToUpdate.id);
    // TODO handle error when budgetLine is not found
    const budgetReplaced = this.budgetList.splice(budgetIndex, 1, budgetToUpdate);
    return budgetReplaced.length === 1;
  }

  delete(budgetId) {
    const budgetIndex = this.budgetList.findIndex((budget) => budget.id === budgetId);
    if (budgetIndex !== -1) {
      return this.budgetList.splice(budgetIndex, 1)[0];
    }
    return null;
  }
}

module.exports = new BudgetRepository();
