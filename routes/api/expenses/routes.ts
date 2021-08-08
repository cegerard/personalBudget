import express from 'express';

import ApiExpenseController from './controller';

const Router = express.Router;

function init(controller: ApiExpenseController) {
  const router = Router()

  router.get('/:id', controller.findById.bind(controller))

  return router;
}

export default { init };
