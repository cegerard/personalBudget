const { budgetRepository, expenseRepository } = require('../../data');

module.exports.listBudgetController = (_, res) => {
  res.render('budgets', { page: 'budgets', budgetList: budgetRepository.budgets });
};

module.exports.createBudgetController = (req, res) => {
  budgetRepository.add({
    name: req.body.name,
    amount: req.body.amount,
    description: req.body.description,
  });
  res.render('budgets', { page: 'budgets', budgetList: budgetRepository.budgets });
};

module.exports.deleteBudgetController = (req, res) => {
  const deletedBudget = budgetRepository.delete(req.params.id);
  const nbDeleteExpenses = expenseRepository.removeAllFromBudget(deletedBudget.id);
  if (deletedBudget !== null && nbDeleteExpenses != null) {
    res.status(204).end();
    return;
  }

  res.status(500).end();
};
