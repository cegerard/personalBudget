const slugify = require('slugify');
const MongoBudgetModel = require('./mongo/budget.model');

class BudgetRepository {
  constructor(modelClass = MongoBudgetModel) {
    this.BudgetModel = modelClass;
  }

  find(selectedFields = []) {
    return this.BudgetModel.find(selectedFields);
  }

  findOneById(budgetId, selectedFields = []) {
    return this.BudgetModel.findById(budgetId, selectedFields);
  }

  create(budget) {
    const createBudget = new this.BudgetModel({
      name: budget.name,
      slug: slugify(budget.name),
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
    });
    return createBudget.save();
  }

  async update(budgetToUpdate) {
    const res = await this.BudgetModel.replaceOne({ id: budgetToUpdate.id }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(budgetId) {
    const res = await this.BudgetModel.remove({ id: budgetId });
    return res.deletedCount === 1;
  }
}

module.exports = BudgetRepository;
