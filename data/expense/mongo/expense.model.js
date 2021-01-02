const mongoose = require('mongoose');
const expenseSchema = require('./expense.schema');

const ExpenseModel = mongoose.model('Expense', expenseSchema);

class MongoExpenseModel {
  constructor(expenseValue) {
    this.expenseValue = expenseValue;
  }

  static find(query = {}) {
    return ExpenseModel.find(query).exec();
  }

  static remove(query = {}) {
    return ExpenseModel.remove(query);
  }

  save() {
    const mongoExpenseInstance = new ExpenseModel(this.expenseValue);
    return mongoExpenseInstance.save();
  }
}

module.exports = MongoExpenseModel;
