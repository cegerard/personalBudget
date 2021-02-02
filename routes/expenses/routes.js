const { Router } = require('express');

function init(controller) {
  const router = Router();

  router.get('/', controller.list.bind(controller));
  router.get('/filter', controller.filterByBudgetLine.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));
  router.post('/:id', controller.patch.bind(controller));
  router.get('/:id', controller.get.bind(controller));

  return router;
}

module.exports = { init };
