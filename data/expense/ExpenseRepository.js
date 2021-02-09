class ExpenseRepository {
  constructor(modelClass) {
    this.ExpenseModel = modelClass;
  }

  find(query) {
    return this.ExpenseModel.find(query);
  }

  create(expenseValue) {
    const newExpense = new this.ExpenseModel(expenseValue);
    return newExpense.save();
  }

  async delete(query) {
    const res = await this.ExpenseModel.remove(query);
    return res.deletedCount > 0;
  }

  async patch(expenseId, attributes) {
    const res = await this.ExpenseModel.updateOne({ _id: expenseId }, attributes);
    return res.n === 1;
  }
}

module.exports = ExpenseRepository;
