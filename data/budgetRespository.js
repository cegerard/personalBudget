const slugify = require('slugify');
const uid = require('uid');
const budgetListSeed = require('./budgetList.json'); // TODO replace this by core service layer when available
const AppError = require('../AppError');

class BudgetRepository {
  constructor() {
    this.budgetList = budgetListSeed;
  }

  find(selectedFields = []) {
    if (selectedFields.length === 0) {
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
    if(foundBudget === undefined) {
      throw new AppError(404, `budget(${budgetId}) not found`);
    }

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
    if(budgetIndex === -1)
      throw new AppError(404, `budget(${budgetToUpdate.id}) not found`);

    const budgetReplaced = this.budgetList.splice(budgetIndex, 1, budgetToUpdate);
    return budgetReplaced.length === 1;
  }

  delete(budgetId) {
    const budgetIndex = this.budgetList.findIndex((budget) => budget.id === budgetId);
    if (budgetIndex !== -1) {
      return this.budgetList.splice(budgetIndex, 1)[0];
    }
    throw new AppError(404, `budget(${budgetId}) not found`);
  }
}

module.exports = new BudgetRepository();
