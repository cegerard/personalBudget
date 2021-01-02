const uid = require('uid');
const MongoExpenseModel = require('./mongo/expense.model');

class ExpenseRepository {
  constructor(modelClass = MongoExpenseModel) {
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
}

module.exports = ExpenseRepository;
