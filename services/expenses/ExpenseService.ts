import { patchableAttributes } from '../../core/@types/expense/types';
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

  // TODO: move to use cases
  async patch(expenseId: string, attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: any = Object.assign({}, attributes);

    if (attributesToPatch.amount !== undefined) {
      attributesToPatch.amount = Number(attributesToPatch.amount);
    }

    return this.repository.patch(expenseId, attributes);
  }
}

module.exports = ExpenseService;
