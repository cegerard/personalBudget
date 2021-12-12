import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import BudgetRepository from '../../../core/interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../../core/interfaces/expense/ExpenseRepository';
import AddExpense from '../../../core/use_cases/budget/expense/AddExpense';
import RemoveExpense from '../../../core/use_cases/budget/expense/RemoveExpense';
import { default as UpdateBudgetExpense } from '../../../core/use_cases/budget/expense/UpdateExpense';
import UpdateExpense from '../../../core/use_cases/expense/UpdateExpense';
import { User } from '../../../core/User';
import ExpenseCreateDto from './dto/ExpenseCreateDto';
import ExpensePatchDto from './dto/ExpensePatchDto';

const selectedField = ['_id', 'name'];

export default class ExpenseController {
  private budgetRepository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.budgetRepository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  async list(req: Request, res: Response) {
    const owner = req.user! as User;

    this._renderExpenseListPage(res, owner.id);
  }

  async filterByBudgetLine(req: Request, res: Response) {
    const owner = req.user! as User;

    this._renderExpenseListPage(res, owner.id, { 'budgetLine.name': req.query.budgetName as string });
  }

  async create(req: Request, res: Response) {
    const expenseDto = new ExpenseCreateDto(req.body);
    const owner = req.user! as User;

    const budgetLine = await this.budgetRepository.findOneById(
      owner.id,
      expenseDto.budgetLineId
    );

    const newExpense = await this.expenseRepository.create({
      ...expenseDto.baseExpense(),
      budgetLine,
      owner: {
        id: owner.id,
        name: owner.fullName,
      },
    });

    const useCase = new AddExpense(budgetLine, this.budgetRepository);
    await useCase.add({
      ...expenseDto.baseExpense(),
      _id: newExpense._id,
    });

    this._renderExpenseListPage(res, owner.id);
  }

  async delete(req: Request, res: Response) {
    const owner = req.user! as User;
    const expenseToDelete = await this.expenseRepository.find(owner.id, { _id: req.params.id });
    const isExpenseDeleted = await this.expenseRepository.delete({ _id: req.params.id });

    if (!isExpenseDeleted) {
      res.status(StatusCodes.NOT_FOUND).end();
      return;
    }

    const useCase = new RemoveExpense(
      expenseToDelete[0].budgetLine._id.toString(),
      owner.id,
      this.budgetRepository
    );
    const isExpenseRemoveFromBudget = await useCase.remove(expenseToDelete[0]._id.toString());

    if (isExpenseRemoveFromBudget) {
      res.status(StatusCodes.NO_CONTENT).end();
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
  }

  async patch(req: Request, res: Response) {
    const owner = req.user! as User;
    const expenseDto = new ExpensePatchDto(req.params.id, req.body);
    const updateExpense = new UpdateExpense(expenseDto.id, this.expenseRepository);

    const isUpdated = await updateExpense.update(expenseDto.attributes());
    if (isUpdated) {
      const useCase = new UpdateBudgetExpense(
        expenseDto.id,
        owner.id,
        this.budgetRepository,
        this.expenseRepository
      );
      await useCase.update();

      this._renderExpenseListPage(res, owner.id);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async _renderExpenseListPage(res: Response, userId: string, query?: { 'budgetLine.name': string }) {
    const expenseList = await this.expenseRepository.find(userId, query);
    const budgetList = await this.budgetRepository.find(userId, selectedField);

    res.render('expenses', {
      page: 'expenses',
      expenseList,
      budgetList,
    });
  }
}
