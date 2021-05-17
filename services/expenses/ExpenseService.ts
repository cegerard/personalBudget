import ExpenseRepository from '../../data/expense/ExpenseRepository';

export default class ExpenseService {
  private repository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.repository = expenseRepository;
  }

  /**
   * List all expenses from the default expense repository
   * @returns list of expense objects
   */
  list() {
    return this.repository.find(null);
  }

  /**
   * Search for expense
   * @param {Object} query
   * @param {Object} query.budgetLine
   * @param {string} query.budgetLine.name
   */
  search(query: any) {
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
  add(expense: any) {
    // TODO validate expense
    return this.repository.create(expense);
  }

  /**
   * Remove an existing expense from the default expense repository
   * @param {Object} query
   */
  remove(query: any) {
    return this.repository.delete(query);
  }

  /**
   * Update expenses attributes from an expense id
   * @param {string} expenseId
   * @param {Object} attributes
   * @param {string} attributes.name
   * @param {Number} attributes.amount
   * @param {string} attributes.date
   */
  async patch(expenseId: string, attributes: any) {
    // TODO validate and convert attributes to update only updatable fields
    if (attributes.amount !== undefined) {
      attributes.amount = Number(attributes.amount);
    }
    delete attributes.budgetLine;

    return this.repository.patch(expenseId, attributes);
  }
}

module.exports = ExpenseService;
