const http = require('http-status-codes').StatusCodes;

const selectedField = ['_id', 'name'];

class ExpenseController {
  constructor(budgetService, expenseService) {
    this.budgetService = budgetService;
    this.expenseService = expenseService;
  }

  async list(_, res) {
    this._renderExpenseListPage(res);
  }

  async filterByBudgetLine(req, res) {
    this._renderExpenseListPage(res, { 'budgetLine.name': req.query.budgetName });
  }

  async get(req, res) {
    const expenses = await this.expenseService.search({ _id: req.params.id });
    if (expenses.length > 0) {
      res.render('expense', {
        page: 'expense',
        expense: expenses[0],
      });
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }

  async create(req, res) {
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

  async delete(req, res) {
    const expenseToDelete = await this.expenseService.search({ _id: req.params.id });
    const isExpenseDeleted = await this.expenseService.remove({ _id: req.params.id });

    if (!isExpenseDeleted) {
      res.status(http.NOT_FOUND).end();
      return;
    }

    const isExpenseRemoveFromBudget = await this.budgetService.removeExpense(
      expenseToDelete[0].budgetLine._id.toString(),
      expenseToDelete[0]._id.toString()
    );

    if (isExpenseRemoveFromBudget) {
      res.status(http.NO_CONTENT).end();
      return;
    }

    res.status(http.INTERNAL_SERVER_ERROR).end();
  }

  async patch(req, res) {
    //TODO adapt the body
    const isUpdated = await this.expenseService.patch(req.params.id, req.body);
    if (isUpdated) {
      await this.budgetService.updateExpense(req.params.id);
      this._renderExpenseListPage(res);
      return;
    }
    res.sendStatus(http.NOT_FOUND);
  }

  async _renderExpenseListPage(res, query = null) {
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

module.exports = ExpenseController;
