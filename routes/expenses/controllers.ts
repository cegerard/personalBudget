import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import ExpenseCreateDto from './dto/ExpenseCreateDto';
import ExpensePatchDto from './dto/ExpensePatchDto';
import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';
import UpdateExpense from '../../core/use_cases/expense/UpdateExpense';
import BudgetService from '../../services/budgets/BudgetService';

const selectedField = ['_id', 'name'];

export default class ExpenseController {
  private budgetService: BudgetService;
  private budgetRepository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(
    budgetService: BudgetService,
    budgetRepository: BudgetRepository,
    expenseRepository: ExpenseRepository
  ) {
    this.budgetService = budgetService;
    this.budgetRepository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  async list(_: Request, res: Response) {
    this._renderExpenseListPage(res, null);
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
    await this.budgetService.addExpense(expenseDto.budgetLineId, {
      ...expenseDto.baseExpense(),
      _id: newExpense._id,
    });

    this._renderExpenseListPage(res, null);
  }

  async delete(req: Request, res: Response) {
    const expenseToDelete = await this.expenseRepository.find({ _id: req.params.id });
    const isExpenseDeleted = await this.expenseRepository.delete({ _id: req.params.id });

    if (!isExpenseDeleted) {
      res.status(StatusCodes.NOT_FOUND).end();
      return;
    }

    const isExpenseRemoveFromBudget = await this.budgetService.removeExpense(
      expenseToDelete[0].budgetLine._id.toString(),
      expenseToDelete[0]._id.toString()
    );

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
      await this.budgetService.updateExpense(expenseDto.id);
      this._renderExpenseListPage(res, null);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async _renderExpenseListPage(res: Response, query: { 'budgetLine.name': string } | null) {
    let expenseList = [];
    if (query === null) {
      expenseList = await this.expenseRepository.find();
    } else {
      expenseList = await this.expenseRepository.find(query);
    }

    const budgetList = await this.budgetRepository.find(selectedField);

    res.render('expenses', {
      page: 'expenses',
      expenseList,
      budgetList,
    });
  }
}
