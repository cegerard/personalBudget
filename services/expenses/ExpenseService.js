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
   * Search for expense
   * @param {Object} query
   * @param {Object} query.budgetLine
   * @param {string} query.budgetLine.name
   */
  search(query) {
    // TODO validate query
    return this.repository.find(query);
  }

  /**
   * Add a new expense to the default expense repository
   * @param {Object} expense the expense object to add
   * @param {string} expense.name
   * @param {number} expense.amount
   * @param {string} expense.date
   * @param {Object} expense.budgetLine
   * @param {string} expense.budgetLine._id
   * @param {Obstringject} expense.budgetLine.name
   * @returns {Expense} the newly created expense
   */
  add(expense) {
    // TODO validate expense
    return this.repository.create(expense);
  }

  /**
   * remove an existing expense from the default expense repository
   * @param {Object} query
   */
  remove(query) {
    return this.repository.delete(query);
  }
}

module.exports = ExpenseService;
