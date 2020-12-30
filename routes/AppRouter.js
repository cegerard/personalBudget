const express = require('express');

const homeRoute = require('./home/routes');
const budgetsRoute = require('./budgets/routes');
const expensesRoute = require('./expenses/routes');

class AppRouter {
  constructor(budgetController) {
    this.router = express.Router();
    
    this.router.use('/', homeRoute);
    this.router.use('/budgets', budgetsRoute.init(budgetController));
    this.router.use('/expenses', expensesRoute);
  }
}

module.exports = AppRouter;
