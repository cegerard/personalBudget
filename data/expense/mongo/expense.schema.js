const mongoose = require('mongoose');

const BudgetLineSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  budgetLine: { type: BudgetLineSchema, required: true },
});

module.exports = expenseSchema;
