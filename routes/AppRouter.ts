import express from 'express';

import homeRoute from './home/routes';
import budgetsRoute from './budgets/routes';
import expensesRoute from './expenses/routes';
import ExpenseController from './expenses/controllers';
import BudgetController from './budgets/controllers';

class AppRouter {
  public router;

  constructor(budgetController: BudgetController, expenseController: ExpenseController) {
    this.router = express.Router();

    this.router.use('/', homeRoute);
    this.router.use('/budgets', budgetsRoute.init(budgetController));
    this.router.use('/expenses', expensesRoute.init(expenseController));
  }
}

export default AppRouter;
