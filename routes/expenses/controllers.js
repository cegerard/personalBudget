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
      res.status(404).end();
      return;
    }

    const isExpenseRemoveFromBudget = await this.budgetService.removeExpense(
      expenseToDelete[0].budgetLine._id.toString(),
      expenseToDelete[0]._id.toString()
      );

    if (isExpenseRemoveFromBudget) {
      res.status(204).end();
      return;
    }

    res.status(500).end();
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
