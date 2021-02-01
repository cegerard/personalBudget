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
      slug: budget.slug,
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
    });
    return createBudget.save();
  }

  async update(budgetToUpdate) {
    const res = await this.BudgetModel.replaceOne({ _id: budgetToUpdate._id }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(budgetId) {
    const res = await this.BudgetModel.remove({ _id: budgetId });
    return res.deletedCount === 1;
  }

  async patch(budgetId, attributes) {
    const res = await this.BudgetModel.patch({ _id: budgetId },  attributes);
    return res.n === 1;
  }
}

module.exports = BudgetRepository;