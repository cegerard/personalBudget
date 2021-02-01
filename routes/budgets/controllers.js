const http = require('http-status-codes').StatusCodes;

class BudgetController {
  constructor(budgetService) {
    this.budgetService = budgetService;
  }

  list(_, res) {
    renderBudgetListPage(res, this.budgetService)
  }

  async get(req, res) {
    const budget = await this.budgetService.getById(req.params.id);
    res.render('budget', { page: 'budget', budget });
  }

  async create(req, res) {
    await this.budgetService.create({
      name: req.body.name,
      amount: req.body.amount,
      description: req.body.description,
    });
    renderBudgetListPage(res, this.budgetService);
  }

  async delete(req, res) {
    const isDeleted = await this.budgetService.remove(req.params.id);
    if(isDeleted) {
      res.sendStatus(http.NO_CONTENT);
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }

  async patch(req, res) {
    const isUpdated = await this.budgetService.patch(req.params.id, req.body);
    if(isUpdated) {
      res.sendStatus(http.NO_CONTENT);
      //TODO render budget page
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }
}

async function renderBudgetListPage(res, budgetService) {
  const budgetList = await budgetService.list();
  res.render('budgets', { page: 'budgets', budgetList: budgetList });
}

module.exports = BudgetController;
