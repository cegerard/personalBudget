const { Router } = require('express');

const { budgetRepository, expenseRepository } = require('../../data');

const router = Router();

router.get('/', (req, res) => {
    res.render('expenses', {
      page: 'expenses',
      expenseList: expenseRepository.expenses,
      budgetList: budgetRepository.simpleBudgets,
    });
  });
  
  router.get('/filter', (req, res) => {
    res.render('expenses', {
      page: 'expenses',
      expenseList: expenseRepository.getForBudgetLineName(req.query.budgetName),
      budgetList: budgetRepository.simpleBudgets,
    });
  });
  
  router.post('/', (req, res) => {
    const budgetLineId = req.body.budgetlineId;
    const budgetLine = budgetRepository.getSimpleBudget(budgetLineId);
    const baseExpense = {
      name: req.body.name,
      amount: req.body.amount,
      date: req.body.date,
    };
  
    const newExpenseId = expenseRepository.add({ ...baseExpense, budgetLine });
    budgetRepository.addExpenseToBudget(budgetLineId, { ...baseExpense, id: newExpenseId });
  
    res.render('expenses', {
      page: 'expenses',
      expenseList: expenseRepository.expenses,
      budgetList: budgetRepository.simpleBudgets,
    });
  });
  
  router.delete('/:id', (req, res) => {
    const deletedFromExpense = expenseRepository.delete(req.params.id);
    const deletedFromBudget = budgetRepository.removeExpenseFromBudget(
      deletedFromExpense.budgetLine.id,
      deletedFromExpense.id
    );
  
    if (deletedFromExpense !== null && deletedFromBudget !== null) {
      res.status(204).end();
      return;
    }
  
    res.status(500).end();
  });


module.exports = router;