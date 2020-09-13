//TODO remove that when expense service is available
const { expenseRepository } = require('../../data');

class BudgetService {
  constructor(budgetRepository) {
    this.repository = budgetRepository;
  }

  /**
   * List all budget from the default budget repository
   * @returns list of full budget objects
   */
  list() {
    return this.repository.getBudgets();
  }

  /**
   * Create a new budget and add it to the default budget repository
   * @param {Object} newBudget the budget object to create
   * @param {string} newBudget.name
   * @param {number} newBudget.amout
   * @param {string} newBudget.description
   * @returns {number} The new number of budgets in the repository
   */
  create(newBudget) {
    // TODO Validate input data using an adapter
    const created = this.repository.addBudget({
      name: newBudget.name,
      amount: newBudget.amount,
      description: newBudget.description,
    });
    // TODO handle repository created error
    return created;
  }

  /**
   * Remove a budget from its identifier and remove all related expenses
   * @param {string} budgetId the application budget identifier
   * @returns {boolean} true if the budget and all its expenses have been removed, false otherwise
   */
  remove(budgetId) {
    const deletedBudget = this.repository.deleteBudget(budgetId);
    // TODO handle budget deletion error
    const nbDeleteExpenses = expenseRepository.removeAllFromBudget(deletedBudget.id);
    // TODO handle expense deletion error
    return deletedBudget !== null && nbDeleteExpenses != null
  }
}

module.exports = BudgetService;
