import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import ExpenseCreateDto from './dto/ExpenseCreateDto';
import BudgetService from '../../services/budgets/BudgetService';
import ExpenseService from '../../services/expenses/ExpenseService';
import ExpensePatchDto from './dto/ExpensePatchDto';
import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';

const selectedField = ['_id', 'name'];

export default class ExpenseController {
  private budgetService: BudgetService;
  private expenseService: ExpenseService;
  private budgetRepository: BudgetRepository;

  constructor(budgetService: BudgetService, expenseService: ExpenseService, budgetRepository: BudgetRepository) {
    this.budgetService = budgetService;
    this.expenseService = expenseService;
    this.budgetRepository = budgetRepository
  }

  async list(_: Request, res: Response) {
    this._renderExpenseListPage(res, null);
  }

  async filterByBudgetLine(req: Request, res: Response) {
    this._renderExpenseListPage(res, { 'budgetLine.name': req.query.budgetName as string });
  }

  async get(req: Request, res: Response) {
    const expenses = await this.expenseService.search({ _id: req.params.id });
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

    const budgetLine = await this.budgetRepository.findOneById(expenseDto.budgetLineId, selectedField);
    const newExpense = await this.expenseService.add({ ...expenseDto.baseExpense(), budgetLine });
    await this.budgetService.addExpense(expenseDto.budgetLineId, {
      ...expenseDto.baseExpense(),
      _id: newExpense._id,
    });

    this._renderExpenseListPage(res, null);
  }

  async delete(req: Request, res: Response) {
    const expenseToDelete = await this.expenseService.search({ _id: req.params.id });
    const isExpenseDeleted = await this.expenseService.remove({_id: req.params.id});

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

    const isUpdated = await this.expenseService.patch(expenseDto.id, expenseDto.attributes());
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
      expenseList = await this.expenseService.list();
    } else {
      expenseList = await this.expenseService.search(query);
    }

    const budgetList = await this.budgetRepository.find(selectedField)

    res.render('expenses', {
      page: 'expenses',
      expenseList,
      budgetList,
    });
  }
}
