const { budgetService } = require('../../services/budgets');

module.exports.listBudgetController = (_, res) => {
  res.render('budgets', { page: 'budgets', budgetList: budgetService.list() });
};

module.exports.createBudgetController = (req, res) => {
  budgetService.create({
    name: req.body.name,
    amount: req.body.amount,
    description: req.body.description,
  });
  res.render('budgets', { page: 'budgets', budgetList: budgetService.list() });
};

module.exports.deleteBudgetController = (req, res) => {
  budgetService.remove(req.params.id);
  res.status(204).end();
};
