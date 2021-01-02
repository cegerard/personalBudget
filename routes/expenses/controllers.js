const selectedField = ['id', 'name'];

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
    await this.budgetService.addExpense(budgetLineId, { ...baseExpense, id: newExpense.id });

    this._renderExpenseListPage(res);
  }

  async delete(req, res) {
    const deletedFromExpense = await this.expenseService.remove(req.params.id);
    const deletedFromBudget = await this.budgetService.removeExpense(
      deletedFromExpense.budgetLine.id,
      deletedFromExpense.id
    );

    if (deletedFromExpense !== null && deletedFromBudget !== null) {
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
