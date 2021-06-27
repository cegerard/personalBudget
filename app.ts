import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import BudgetRepository from './core/interfaces/budget/BudgetRepository';
import AppRouter from './routes/AppRouter';
import BudgetController from './routes/budgets/controllers';
import ExpenseController from './routes/expenses/controllers';

import BudgetRepositoryStub from './test/stubs/BudgetRepositoryStub';
import ExpenseModelStub from './test/stubs/ExpenseModelStub';

import {
  connectDb,
  expenseModel,
  MongoBudgetRepository,
  MongoExpenseRepository,
} from './db/mongo';

class Application {
  private mode: string;
  public app: any;
  public budgetRepository: BudgetRepository

  constructor() {
    this.app = express();
    this.mode = this.app.get('env');

    let basePath = __dirname;

    if (this.mode === 'production') {
      connectDb();
      this.budgetRepository = new MongoBudgetRepository();
    } else {
      this.budgetRepository = new BudgetRepositoryStub();
    }

    if (this.mode === 'production' || this.mode === 'dev') {
      basePath = `${__dirname}/..`;
    }

    this._setupViewEngine(basePath);
    this._setupRouter();
    this._setupErrorHandling();
  }

  _setupViewEngine(basePath: string) {
    this.app.set('views', path.join(basePath, 'views'));
    this.app.set('view engine', 'pug');

    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(express.static(path.join(basePath, 'public')));
  }

  _setupRouter() {
    let ExpenseModel;

    if (this.mode !== 'production') {
      ExpenseModel = ExpenseModelStub;
    } else {
      ExpenseModel = expenseModel;
    }

    const expenseRepository = new MongoExpenseRepository(ExpenseModel);

    const budgetController = new BudgetController(this.budgetRepository, expenseRepository);
    const expenseController = new ExpenseController(this.budgetRepository, expenseRepository);

    const appRouter = new AppRouter(budgetController, expenseController);

    this.app.use('/', appRouter.router);
  }

  _setupErrorHandling() {
    // catch 404 and forward to error handler
    this.app.use((req: any, res: any, next: any) => {
      next(createError(404));
    });

    // error handler
    this.app.use((err: any, req: any, res: any) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }
}

export default new Application();
