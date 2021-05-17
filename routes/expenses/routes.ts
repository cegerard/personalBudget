import express from 'express';

import ExpenseController from './controllers';

const Router = express.Router;

function init(controller: ExpenseController) {
  const router = Router();

  router.get('/', controller.list.bind(controller));
  router.get('/filter', controller.filterByBudgetLine.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));
  router.post('/:id', controller.patch.bind(controller));
  router.get('/:id', controller.get.bind(controller));

  return router;
}

export default { init };
