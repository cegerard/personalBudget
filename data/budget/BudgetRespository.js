class BudgetRepository {
  constructor(modelClass) {
    this.BudgetModel = modelClass;
  }

  find(selectedFields = []) {
    return this.BudgetModel.find({}, selectedFields);
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
      category: budget.category
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
    const res = await this.BudgetModel.updateOne({ _id: budgetId },  attributes);
    return res.n === 1;
  }
}

module.exports = BudgetRepository;
