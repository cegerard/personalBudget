const mongoose = require('mongoose');
const budgetSchema = require('./budget.schema');

const BudgetModel = mongoose.model('Budget', budgetSchema);

class MongoBudgetModel {
  constructor(budgetValue) {
    this.budgetValue = budgetValue;
  }

  static find(selectedFields) {
    return BudgetModel.find({}, selectedFields).exec();
  }

  static findById(budgetId, selectedFields) {
    return BudgetModel.findById(budgetId, selectedFields).exec();
  }

  static replaceOne(budgetFilter, newBudgetValue) {
    return BudgetModel.replaceOne(budgetFilter, newBudgetValue);
  }

  static remove(budgetFilter) {
    return BudgetModel.remove(budgetFilter);
  }

  save() {
    const mongoBudgetInstance = new BudgetModel(this.budgetValue);
    return mongoBudgetInstance.save();
  }
}

module.exports = MongoBudgetModel;
