import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';

import BudgetService from '../../services/budgets/BudgetService';
import BudgetCreateDto from './dto/BudgetCreateDto';
import BudgetPatchDto from './dto/BudgetPatchDto';

export default class BudgetController {
  private budgetService: BudgetService;
  private budgetRepository: BudgetRepository;

  constructor(budgetService: BudgetService, budgetRepository: BudgetRepository) {
    this.budgetService = budgetService;
    this.budgetRepository = budgetRepository;
  }

  list(_: Request, res: Response) {
    this.renderBudgetListPage(res);
  }

  get(req: Request, res: Response) {
    this.renderBudgetPage(req, res);
  }

  async create(req: Request, res: Response) {
    const budgetDto = new BudgetCreateDto(req.body);
    await this.budgetService.create(budgetDto.toBudget());
    this.renderBudgetListPage(res);
  }

  async delete(req: Request, res: Response) {
    const isDeleted = await this.budgetService.remove(req.params.id);
    if (isDeleted) {
      res.sendStatus(StatusCodes.NO_CONTENT);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  async patch(req: Request, res: Response) {
    const budgetDto = new BudgetPatchDto(req.params.id, req.body);

    const isUpdated = await this.budgetService.patch(budgetDto.id, budgetDto.attributes());
    if (isUpdated) {
      this.renderBudgetPage(req, res);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async renderBudgetListPage(res: Response) {
    const budgetList = await this.budgetRepository.find([]);
    res.render('budgets', { page: 'budgets', budgetList: budgetList });
  }

  private async renderBudgetPage(req: Request, res: Response) {
    const budget = await this.budgetRepository.findOneById(req.params.id, []);
    res.render('budget', { page: 'budget', budget });
  }
}
