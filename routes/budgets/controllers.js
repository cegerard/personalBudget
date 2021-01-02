class BudgetController {
  constructor(budgetService) {
    this.budgetService = budgetService;
  }

  list(_, res) {
    this._renderBudgetListPage(res)
  }

  async create(req, res) {
    await this.budgetService.create({
      name: req.body.name,
      amount: req.body.amount,
      description: req.body.description,
    });
    this._renderBudgetListPage(res);
  }

  async delete(req, res) {
    const isDeleted = await this.budgetService.remove(req.params.id);
    if(isDeleted) {
      res.status(204).end();
      return;
    }
    res.status(404).end();
  }

  async _renderBudgetListPage(res) {
    const budgetList = await this.budgetService.list();
    res.render('budgets', { page: 'budgets', budgetList: budgetList });
  }
}

module.exports = BudgetController;
