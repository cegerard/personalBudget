import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import BudgetService from './services/budgets/BudgetService';
import AppRouter from './routes/AppRouter';
import BudgetController from './routes/budgets/controllers';
import ExpenseController from './routes/expenses/controllers';

import BudgetModelStub from './test/stubs/BudgetModelStub';
import ExpenseModelStub from './test/stubs/ExpenseModelStub';
import {
  connectDb,
  budgetModel,
  expenseModel,
  MongoBudgetRepository,
  MongoExpenseRepository,
} from './db/mongo';

class Application {
  private mode: string;
  public app: any;

  constructor() {
    this.app = express();
    this.mode = this.app.get('env');

    let basePath = __dirname;

    if (this.mode === 'production') {
      connectDb();
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
    let BudgetModel;
    let ExpenseModel;

    if (this.mode !== 'production') {
      BudgetModel = BudgetModelStub;
      ExpenseModel = ExpenseModelStub;
    } else {
      BudgetModel = budgetModel;
      ExpenseModel = expenseModel;
    }

    const budgetRepository = new MongoBudgetRepository(BudgetModel);
    const expenseRepository = new MongoExpenseRepository(ExpenseModel);

    const budgetService = new BudgetService(budgetRepository, expenseRepository);

    const budgetController = new BudgetController(budgetService, budgetRepository);
    const expenseController = new ExpenseController(
      budgetService,
      budgetRepository,
      expenseRepository
    );
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
