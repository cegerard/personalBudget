const slugify = require('slugify');

class BudgetService {
  constructor(budgetRepository, expenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  /**
   * List all budget from the default budget repository
   * @param {string[]} select selected field from budget model
   * @returns Promise: list of full budget objects
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
      slug: slugify(newBudget.name),
      amount: newBudget.amount,
      description: newBudget.description,
    });
  }

  /**
   * Remove a budget from its identifier and remove all related expenses
   * @param {string} budgetId
   * @returns {boolean} true if the budget and all its expenses have been removed, false otherwise
   */
  async remove(budgetId) {
    const isDeleted = await this.repository.delete(budgetId);
    if (isDeleted) {
      this.expenseRepository.delete({ 'budgetLine._id': budgetId });
    }
    return isDeleted;
  }

  async patch(budgetId, attributes) {
    // TODO validate and convert attributes to update only updatable fields
    if(attributes.name !== undefined) {
      attributes.slug = slugify(attributes.name);
    }

    if(attributes.amount !== undefined) {
      const budget = await this.repository.findOneById(budgetId);
      if(budget === undefined) {
        return false;
      }
      const amountDiff = attributes.amount - budget.amount;
      attributes.available = budget.available + amountDiff;
    }
    return this.repository.patch(budgetId, attributes);
  }

  /**
   * Add an expense to an existing budget
   * @param {string} budgetId
   * @param {Object} expense
   * @param {string} expense._id
   * @param {string} expense.name
   * @param {number} expense.amount
   * @param {string} expense.date
   * @returns {boolean} true the expense has been added to the budget, false otherwise
   */
  async addExpense(budgetId, expense) {
    // TODO adapt expense to BudgetExpense sub-model
    const foundBudget = await this.repository.findOneById(budgetId);
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
  async removeExpense(budgetId, expenseId) {
    const foundBudget = await this.repository.findOneById(budgetId);
    const expenseIndex = foundBudget.expenses.findIndex((expense) => expense._id.toString() === expenseId);
    if (expenseIndex !== -1) {
      const deletedExpenses = foundBudget.expenses.splice(expenseIndex, 1);
      foundBudget.available += deletedExpenses[0].amount;
      return this.repository.update(foundBudget);
    }
    return false;
  }
}

module.exports = BudgetService;
