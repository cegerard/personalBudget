const http = require('http-status-codes').StatusCodes;

class BudgetController {
  constructor(budgetService) {
    this.budgetService = budgetService;
  }

  list(_, res) {
    renderBudgetListPage(res, this.budgetService);
  }

  get(req, res) {
    renderBudgetPage(req, res, this.budgetService);
  }

  async create(req, res) {
    await this.budgetService.create({
      name: req.body.name,
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      type: req.body.type,
    });
    renderBudgetListPage(res, this.budgetService);
  }

  async delete(req, res) {
    const isDeleted = await this.budgetService.remove(req.params.id);
    if (isDeleted) {
      res.sendStatus(http.NO_CONTENT);
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }

  async patch(req, res) {
     // TODO validate and convert attributes to update only updatable fields
     if(req.body.available) {
       req.body.available = +req.body.available;
     }
    const isUpdated = await this.budgetService.patch(req.params.id, req.body);
    if (isUpdated) {
      renderBudgetPage(req, res, this.budgetService);
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }
}

async function renderBudgetListPage(res, budgetService) {
  const budgetList = await budgetService.list();
  res.render('budgets', { page: 'budgets', budgetList: budgetList });
}

async function renderBudgetPage(req, res, budgetService) {
  const budget = await budgetService.getById(req.params.id);
  res.render('budget', { page: 'budget', budget });
}

module.exports = BudgetController;
