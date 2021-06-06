import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import BudgetService from '../../services/budgets/BudgetService';
import ExpenseService from '../../services/expenses/ExpenseService';


const selectedField = ['_id', 'name'];

export default class ExpenseController {
  private budgetService: BudgetService;
  private expenseService: ExpenseService;

  constructor(budgetService: BudgetService, expenseService: ExpenseService) {
    this.budgetService = budgetService;
    this.expenseService = expenseService;
  }

  async list(_: Request, res: Response) {
    this._renderExpenseListPage(res);
  }

  async filterByBudgetLine(req: Request, res: Response) {
    // TODO: validate request with DTO
    this._renderExpenseListPage(res, { 'budgetLine.name': req.query.budgetName });
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
    // TODO: validate request with DTO
    const budgetLineId = req.body.budgetlineId;
    const budgetLine = await this.budgetService.getById(budgetLineId, selectedField);
    const baseExpense = {
      name: req.body.name,
      amount: req.body.amount,
      date: req.body.date,
    };

    const newExpense = await this.expenseService.add({ ...baseExpense, budgetLine });
    await this.budgetService.addExpense(budgetLineId, { ...baseExpense, _id: newExpense._id });

    this._renderExpenseListPage(res);
  }

  async delete(req: Request, res: Response) {
    // TODO: validate request with DTO
    const expenseToDelete = await this.expenseService.search({ _id: req.params.id });
    const isExpenseDeleted = await this.expenseService.remove({ _id: req.params.id });

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
    //TODO adapt the body
    const isUpdated = await this.expenseService.patch(req.params.id, req.body);
    if (isUpdated) {
      await this.budgetService.updateExpense(req.params.id);
      this._renderExpenseListPage(res);
      return;
    }
    res.sendStatus(StatusCodes.NOT_FOUND);
  }

  private async _renderExpenseListPage(res: Response, query: any = null) {
    let expenseList = [];
    if (query === null) {
      expenseList = await this.expenseService.list();
    } else {
      expenseList = await this.expenseService.search(query);
    }

    const budgetList = await this.budgetService.list(selectedField);

    res.render('expenses', {
      page: 'expenses',
      expenseList,
      budgetList,
    });
  }
}
