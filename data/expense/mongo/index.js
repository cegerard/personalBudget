const mongoose = require('mongoose');

const expenseSchema = require('./expense.schema');

module.exports = mongoose.model('Expense', expenseSchema);