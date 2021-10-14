import express from 'express';

import homeRoute from './home/routes';
import budgetsRoute from './budgets/routes';
import expensesRoute from './expenses/routes';
import ExpenseController from './expenses/controllers';
import BudgetController from './budgets/controllers';
import HomeController from './home/controllers';
import Authentication from '../../lib/security/authentication';

class AppRouter {
  public router;

  constructor(
    homeController: HomeController,
    budgetController: BudgetController,
    expenseController: ExpenseController
  ) {
    this.router = express.Router();

    this.router.use('/', homeRoute.init(homeController));
    this.router.use(
      '/budgets',
      Authentication.ensureAuthenticated,
      budgetsRoute.init(budgetController)
    );
    this.router.use(
      '/expenses',
      Authentication.ensureAuthenticated,
      expensesRoute.init(expenseController)
    );
  }
}

export default AppRouter;
