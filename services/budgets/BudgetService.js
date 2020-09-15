// TODO remove this dependency
const { expenseRepository } = require('../../data');

class BudgetService {
  constructor(budgetRepository) {
    this.repository = budgetRepository;
  }

  /**
   * List all budget from the default budget repository
   * @param {string[]} select selected field from budget model
   * @returns list of full budget objects
   */
  list(select) {
    return this.repository.find(select);
  }

  /**
   * Get a budget from the default budget repository
   * @param {string} budgetId
   * @param {string[]} select selected fields from budget model
   */
  getById(budgetId, select) {
    return this.repository.findOneById(budgetId, select);
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
    return this.repository.create({
      name: newBudget.name,
      amount: newBudget.amount,
      description: newBudget.description,
    });
  }

  /**
   * Remove a budget from its identifier and remove all related expenses
   * @param {string} budgetId
   * @returns {boolean} true if the budget and all its expenses have been removed, false otherwise
   */
  remove(budgetId) {
    const deletedBudget = this.repository.delete(budgetId);
    expenseRepository.deleteMany({ budget: { id: deletedBudget.id } });
    return true;
  }

  /**
   * Add an expense to an existing budget
   * @param {string} budgetId
   * @param {Object} expense
   * @param {string} expense.id
   * @param {string} expense.name
   * @param {number} expense.amount
   * @param {string} expense.date
   * @returns {boolean} true the expense has been added to the budget, false otherwise
   */
  addExpense(budgetId, expense) {
    // TODO adapt expense to BudgetExpense sub-model
    const foundBudget = this.repository.findOneById(budgetId);
    foundBudget.expenses.push(expense);
    // compute available field
    foundBudget.available -= expense.amount;

    return this.repository.update(foundBudget);
  }

  /**
   * Remove expense from an existing budget
   * @param {string} budgetId
   * @param {string} expenseId
   */
  removeExpense(budgetId, expenseId) {
    const foundBudget = this.repository.findOneById(budgetId);
    const expenseIndex = foundBudget.expenses.findIndex((expense) => expense.id === expenseId);
    if (expenseIndex !== -1) {
      foundBudget.expenses.splice(expenseIndex, 1);
      return this.repository.update(foundBudget);
    }
    return false;
  }
}

module.exports = BudgetService;
