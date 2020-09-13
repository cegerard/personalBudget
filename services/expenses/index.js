const { expenseRepository } = require('../../data');
const ExpenseService = require('./ExpenseService');

module.exports.expenseService = new ExpenseService(expenseRepository);
