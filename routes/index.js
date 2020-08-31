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

module.exports = router;
