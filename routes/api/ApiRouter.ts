import express from 'express';

import expensesRoute from './expenses/routes';
import ApiExpenseController from './expenses/controller';

class ApiRouter {
  public router;

  constructor(expenseController: ApiExpenseController) {
    this.router = express.Router();

    this.router.use('/expenses', expensesRoute.init(expenseController));
  }
}

export default ApiRouter;
