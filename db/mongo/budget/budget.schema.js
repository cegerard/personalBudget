const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  available: { type: Number, required: true },
  type: {
    type: String,
    enum: ['NORMAL', 'RESERVE'],
    default: 'NORMAL',
    require: true
  },
  expenses: { type: [ExpenseSchema], default: [] },
  category: { type: String },
});

module.exports = budgetSchema;
