const { Router } = require('express');

const {
  createExpenseController,
  deleteExpenseController,
  filterByBudgetLineController,
  listExpensesController,
} = require('./controllers');

const router = Router();

router.get('/', listExpensesController);
router.get('/filter', filterByBudgetLineController);
router.post('/', createExpenseController);
router.delete('/:id', deleteExpenseController);

module.exports = router;
