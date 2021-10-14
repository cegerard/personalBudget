import express from 'express';

import expensesRoute from './expenses/routes';
import ApiExpenseController from './expenses/controller';
import Authentication from '../../lib/security/authentication';

class ApiRouter {
  public router;

  constructor(expenseController: ApiExpenseController) {
    this.router = express.Router();

    this.router.use(
      '/expenses',
      Authentication.ensureAuthenticated,
      expensesRoute.init(expenseController)
    );
  }
}

export default ApiRouter;
