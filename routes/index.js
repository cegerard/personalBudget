const express = require('express');
const { budgetRepository, expenseRepository } = require('../data');

const router = express.Router();

/* GET home page */
router.get('/', (req, res) => res.redirect(`${req.baseUrl}/budgets`));

/* Budgets routes */
router.get('/budgets', (req, res) => {
  res.render('budgets', { page: 'budgets', budgetList: budgetRepository.budgets });
});

router.post('/budgets', (req, res) => {
  budgetRepository.add({
    name: req.body.name,
    amount: req.body.amount,
    description: req.body.description,
  });
  res.render('budgets', { page: 'budgets', budgetList: budgetRepository.budgets });
});

router.delete('/budgets/:id', (req, res) => {
  const deletedBudget = budgetRepository.delete(req.params.id);
  const nbDeleteExpenses = expenseRepository.removeAllFromBudget(deletedBudget.id);
  if (deletedBudget !== null && nbDeleteExpenses != null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
});

/* Expenses routes */
router.get('/expenses', (req, res) => {
  res.render(
    'expenses',
    {
      page: 'expenses',
      expenseList: expenseRepository.expenses,
      budgetList: budgetRepository.simpleBudgets,
    },
  );
});

router.post('/expenses', (req, res) => {
  const budgetLineId = req.body.budgetlineId;
  const budgetLine = budgetRepository.getSimpleBudget(budgetLineId);
  const baseExpense = {
    name: req.body.name,
    amount: req.body.amount,
    date: req.body.date,
  };

  const newExpenseId = expenseRepository.add({ ...baseExpense, budgetLine });
  budgetRepository.addExpenseToBudget(budgetLineId, { ...baseExpense, id: newExpenseId });

  res.render(
    'expenses',
    {
      page: 'expenses',
      expenseList: expenseRepository.expenses,
      budgetList: budgetRepository.simpleBudgets,
    },
  );
});

router.delete('/expenses/:id', (req, res) => {
  const deletedFromExpense = expenseRepository.delete(req.params.id);
  const deletedFromBudget = budgetRepository.removeExpenseFromBudget(
    deletedFromExpense.budgetLine.id,
    deletedFromExpense.id,
  );

  if (deletedFromExpense !== null && deletedFromBudget !== null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
});

module.exports = router;
