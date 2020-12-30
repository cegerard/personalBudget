const { budgetService } = require('../../services/budgets/BudgetService');
const { expenseService } = require('../../services/expenses');

const selectedField = ['id', 'name'];

module.exports.listExpensesController = (_, res) => {
  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseService.list(),
    budgetList: budgetService.list(selectedField),
  });
};

module.exports.filterByBudgetLineController = (req, res) => {
  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseService.search({ budget: { name: req.query.budgetName } }),
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

  const newExpenseId = expenseService.add({ ...baseExpense, budgetLine });
  budgetService.addExpense(budgetLineId, { ...baseExpense, id: newExpenseId });

  res.render('expenses', {
    page: 'expenses',
    expenseList: expenseService.list(),
    budgetList: budgetService.list(selectedField),
  });
};

module.exports.deleteExpenseController = (req, res) => {
  const deletedFromExpense = expenseService.remove(req.params.id);
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
