import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';
import AddExpense from '../../core/use_cases/budget/expense/AddExpense';
import RemoveExpense from '../../core/use_cases/budget/expense/RemoveExpense';
import { default as UpdateBudgetExpense } from '../../core/use_cases/budget/expense/UpdateExpense';
import UpdateExpense from '../../core/use_cases/expense/UpdateExpense';
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

  async list(_: Request, res: Response) {
    this._renderExpenseListPage(res);
  }

  async filterByBudgetLine(req: Request, res: Response) {
    this._renderExpenseListPage(res, { 'budgetLine.name': req.query.budgetName as string });
  }

  async get(req: Request, res: Response) {
    const expenses = await this.expenseRepository.find({ _id: req.params.id });

    if (expenses.length > 0) {
      res.render('expense', {
        page: 'expense',
        expense: expenses[0],
      });
      return;
    }

    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  async create(req: Request, res: Response) {
    const expenseDto = new ExpenseCreateDto(req.body);

    const budgetLine = await this.budgetRepository.findOneById(
      expenseDto.budgetLineId,
      selectedField
    );

    const newExpense = await this.expenseRepository.create({
      ...expenseDto.baseExpense(),
      budgetLine,
    });

    const useCase = new AddExpense(expenseDto.budgetLineId, this.budgetRepository);
    await useCase.add({
      ...expenseDto.baseExpense(),
      _id: newExpense._id,
    });

    this._renderExpenseListPage(res);
  }

  async delete(req: Request, res: Response) {
    const expenseToDelete = await this.expenseRepository.find({ _id: req.params.id });
    const isExpenseDeleted = await this.expenseRepository.delete({ _id: req.params.id });

    if (!isExpenseDeleted) {
      res.status(StatusCodes.NOT_FOUND).end();
      return;
    }

    const useCase = new RemoveExpense(
      expenseToDelete[0].budgetLine._id.toString(),
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
    const expenseDto = new ExpensePatchDto(req.params.id, req.body);
    const updateExpense = new UpdateExpense(expenseDto.id, this.expenseRepository);

    const isUpdated = await updateExpense.update(expenseDto.attributes());
    if (isUpdated) {
      const useCase = new UpdateBudgetExpense(
        expenseDto.id,
        this.budgetRepository,
        this.expenseRepository
      );
      await useCase.update();
      this._renderExpenseListPage(res);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async _renderExpenseListPage(res: Response, query?: { 'budgetLine.name': string }) {
    const expenseList = await this.expenseRepository.find(query);
    const budgetList = await this.budgetRepository.find(selectedField);

    res.render('expenses', {
      page: 'expenses',
      expenseList,
      budgetList,
    });
  }
}
