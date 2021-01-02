const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const BudgetRepository = require('./data/budget/BudgetRespository');
const ExpenseRepository = require('./data/expense/ExpenseRepository');
const BudgetService = require('./services/budgets/BudgetService');
const ExpenseService = require('./services/expenses/ExpenseService');
const AppRouter = require('./routes/AppRouter');
const BudgetController = require('./routes/budgets/controllers');
const ExpenseController = require('./routes/expenses/controllers');

class Application {
  constructor() {
    this.app = express();

    this._setupMongo();
    this._setupViewEngine();
    this._setupRouter();
    this._setupErrorHandling();
  }

  _setupMongo() {
    const USER = process.env.USER;
    const PASSWORD = process.env.PASSWORD;
    const DB = process.env.DB;
    mongoose.connect(
      `mongodb+srv://${USER}:${PASSWORD}@dev.hw9tl.azure.mongodb.net/${DB}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
  }

  _setupViewEngine() {
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'pug');

    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  _setupRouter() {
    const budgetRepository = new BudgetRepository();
    const expenseRepository = new ExpenseRepository();

    const budgetService = new BudgetService(budgetRepository, expenseRepository);
    const expenseService = new ExpenseService(expenseRepository);

    const budgetController = new BudgetController(budgetService);
    const expenseController = new ExpenseController(budgetService, expenseService);
    const appRouter = new AppRouter(budgetController, expenseController);
    this.app.use('/', appRouter.router);
  }

  _setupErrorHandling() {
    // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      next(createError(404));
    });

    // error handler
    this.app.use((err, req, res) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }
}

module.exports = new Application();
