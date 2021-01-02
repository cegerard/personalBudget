const { Router } = require('express');

function init(controller) {
  const router = Router();

  router.get('/', controller.list.bind(controller));
  router.get('/filter', controller.filterByBudgetLine.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  return router;
}

module.exports = { init };
