import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import BudgetRepository from '../../../core/interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../../core/interfaces/expense/ExpenseRepository';
import { User } from '../../../core/User';
import CreateBudget from '../../../core/use_cases/budget/CreateBudget';
import RemoveBudget from '../../../core/use_cases/budget/RemoveBudget';
import UpdateBudget from '../../../core/use_cases/budget/UpdateBudget';

import BudgetCreateDto from './dto/BudgetCreateDto';
import BudgetPatchDto from './dto/BudgetPatchDto';

export default class BudgetController {
  private budgetRepository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.budgetRepository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  list(req: Request, res: Response) {
    const owner = req.user! as User;

    this.renderBudgetListPage(res, owner.id);
  }

  get(req: Request, res: Response) {
    this.renderBudgetPage(req, res);
  }

  async create(req: Request, res: Response) {
    const budgetDto = new BudgetCreateDto(req.body);
    const owner = req.user! as User;

    await new CreateBudget(this.budgetRepository).create(budgetDto.toBudget(), owner);
    this.renderBudgetListPage(res, owner.id);
  }

  async delete(req: Request, res: Response) {
    const owner = req.user! as User;
    const useCase = new RemoveBudget(this.budgetRepository, this.expenseRepository);
    const isDeleted = await useCase.remove(req.params.id, owner.id);
    if (isDeleted) {
      res.sendStatus(StatusCodes.NO_CONTENT);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  async patch(req: Request, res: Response) {
    const owner = req.user! as User;
    const budgetDto = new BudgetPatchDto(req.params.id, req.body);
    const useCase = new UpdateBudget(budgetDto.id, owner.id, this.budgetRepository);
    const isUpdated = await useCase.patch(budgetDto.attributes());
    if (isUpdated) {
      this.renderBudgetPage(req, res);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async renderBudgetListPage(res: Response, userId: string) {  
    const budgetList = await this.budgetRepository.find(userId, []);
    res.render('budgets', { page: 'budgets', budgetList: budgetList });
  }

  private async renderBudgetPage(req: Request, res: Response) {
    const owner = req.user! as User;

    const budget = await this.budgetRepository.findOneById(owner.id, req.params.id);

    if (budget) {
      return res.render('budget', { page: 'budget', budget });
    }

    res.sendStatus(StatusCodes.NOT_FOUND);
  }
}
