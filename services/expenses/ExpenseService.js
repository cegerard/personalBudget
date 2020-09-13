class ExpenseService {
  constructor(expenseRepository) {
    this.repository = expenseRepository;
  }

  /**
   * List all expenses from the default expense repository
   * @returns list of expense objects
   */
  list() {
    return this.repository.find();
  }

  /**
   * Search for expense (search only work for budget name)
   * @param {Object} query
   * @param {Object} query.budget
   * @param {string} query.budget.name
   */
  search(query) {
    // TODO validate query
    return this.repository.search(query);
  }

  /**
   * Add a new expense to the default expense repository
   * @param {Object} expense the expense object to add
   * @param {string} expense.name
   * @param {number} expense.amount
   * @param {string} expense.date
   * @param {Object} expense.budgetLine
   * @param {string} expense.budgetLine.id
   * @param {Obstringject} expense.budgetLine.name
   * @returns {string} the new expense identifier
   */
  add(expense) {
    // TODO validate expense
    return this.repository.create(expense);
  }

  /**
   * remove an existing expense from the default expense repository
   * @param {string} expenseId
   */
  remove(expenseId) {
    return this.repository.delete(expenseId);
  }
}

module.exports = ExpenseService;
