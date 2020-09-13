const { budgetRepository } = require('../../data');
const BudgetService = require('./BudgetService');

module.exports.budgetService = new BudgetService(budgetRepository);
