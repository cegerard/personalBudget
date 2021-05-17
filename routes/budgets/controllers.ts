import { StatusCodes } from 'http-status-codes';

import BudgetService from '../../services/budgets/BudgetService';

export default class BudgetController {
  private budgetService: BudgetService;

  constructor(budgetService: BudgetService) {
    this.budgetService = budgetService;
  }

  list(_: any, res: any) {
    renderBudgetListPage(res, this.budgetService);
  }

  get(req: any, res: any) {
    renderBudgetPage(req, res, this.budgetService);
  }

  async create(req: any, res: any) {
    await this.budgetService.create({
      name: req.body.name,
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      type: req.body.type,
    });
    renderBudgetListPage(res, this.budgetService);
  }

  async delete(req: any, res: any) {
    const isDeleted = await this.budgetService.remove(req.params.id);
    if (isDeleted) {
      res.sendStatus(StatusCodes.NO_CONTENT);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  async patch(req: any, res: any) {
    // TODO validate and convert attributes to update only updatable fields
    if (req.body.available) {
      req.body.available = +req.body.available;
    }
    const isUpdated = await this.budgetService.patch(req.params.id, req.body);
    if (isUpdated) {
      renderBudgetPage(req, res, this.budgetService);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}

async function renderBudgetListPage(res: any, budgetService: BudgetService) {
  const budgetList = await budgetService.list([]);
  res.render('budgets', { page: 'budgets', budgetList: budgetList });
}

async function renderBudgetPage(req: any, res: any, budgetService: BudgetService) {
  const budget = await budgetService.getById(req.params.id, []);
  res.render('budget', { page: 'budget', budget });
}
