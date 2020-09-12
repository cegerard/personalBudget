const { Router } = require('express');

const {
  createBudgetController,
  deleteBudgetController,
  listBudgetController,
} = require('./controllers');

const router = Router();

router.get('/', listBudgetController);
router.post('/', createBudgetController);
router.delete('/:id', deleteBudgetController);

module.exports = router;
