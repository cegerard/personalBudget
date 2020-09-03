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
  const deleted = budgetRepository.delete(req.params.id);
  if (deleted !== null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
});

/* Expenses routes */
router.get('/expenses', (req, res) => {
  res.render('expenses', { page: 'expenses', expenseList: expenseRepository.expenses });
});

router.post('/expenses', (req, res) => {
  expenseRepository.add({
    name: req.body.name,
    amount: req.body.amount,
    date: req.body.date,
    budgetLine: req.body.budgetline,
  });
  res.render('expenses', { page: 'expenses', expenseList: expenseRepository.expenses });
});

router.delete('/expenses/:id', (req, res) => {
  const deleted = expenseRepository.delete(req.params.id);
  if (deleted !== null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
});

module.exports = router;
