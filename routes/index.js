const express = require('express');
const { budgetRepository } = require('../data');
const expenseList = require('../data/expenseList.json'); // TODO replace this by core service layer when available

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
  res.render('expenses', { page: 'expenses', expenseList });
});

module.exports = router;
