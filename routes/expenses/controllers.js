const { expenseRepository } = require('../../data');
const { budgetService } = require('../../services/budgets');

const selectedField = ['id', 'name'];

module.exports.listExpensesController = (_, res) => {
  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseRepository.expenses,
    budgetList: budgetService.list(selectedField),
  });
};

module.exports.filterByBudgetLineController = (req, res) => {
  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseRepository.getForBudgetLineName(req.query.budgetName),
    budgetList: budgetService.list(selectedField),
  });
};

module.exports.createExpenseController = (req, res) => {
  const budgetLineId = req.body.budgetlineId;
  const budgetLine = budgetService.getById(budgetLineId, selectedField);
  const baseExpense = {
    name: req.body.name,
    amount: req.body.amount,
    date: req.body.date,
  };

  const newExpenseId = expenseRepository.add({ ...baseExpense, budgetLine });
  budgetService.addExpense(budgetLineId, { ...baseExpense, id: newExpenseId });

  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseRepository.expenses,
    budgetList: budgetService.list(selectedField),
  });
};

module.exports.deleteExpenseController = (req, res) => {
  const deletedFromExpense = expenseRepository.delete(req.params.id);
  const deletedFromBudget = budgetService.removeExpense(
    deletedFromExpense.budgetLine.id,
    deletedFromExpense.id
  );

  if (deletedFromExpense !== null && deletedFromBudget !== null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
};
