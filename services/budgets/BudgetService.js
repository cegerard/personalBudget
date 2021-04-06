const slugify = require('slugify');

class BudgetService {
  constructor(budgetRepository, expenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  /**
   * List all budget from the default budget repository
   * @param {string[]} select selected field from budget model
   * @returns Promise: list of budget objects
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
   * @param {number} newBudget.amount
   * @param {string} newBudget.description
   * @param {string} newBudget.category
   * @param {string} newBudget.type
   * @returns {Object} Promise: the saved object
   */
  create(newBudget) {
    // TODO Validate input data using an adapter
    return this.repository.create({
      name: newBudget.name,
      slug: slugify(newBudget.name, { lower: true }),
      amount: newBudget.amount,
      description: newBudget.description,
      category: newBudget.category,
      type: newBudget.type,
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

  /**
   * Update some attributes of a budget from its identifier
   * @param {string} budgetId
   * @param {Object} attributes
   * @param {string} attributes.name
   * @param {number} attributes.amout
   * @param {string} attributes.description
   * @param {string} attributes.category
   * @param {string} attributes.type
   * @return {boolean} true if the budget has been udpated, false otherwise
   */
  async patch(budgetId, attributes) {
    // TODO validate and convert attributes to update only updatable fields
    if (attributes.name !== undefined) {
      attributes.slug = slugify(attributes.name, { lower: true });
    }

    if (attributes.amount !== undefined) {
      const budget = await this.repository.findOneById(budgetId);

      if (budget === undefined) {
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
    if (!foundBudget) {
      return false;
    }

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense) => expense._id.toString() === expenseId
    );
    if (expenseIndex !== -1) {
      const deletedExpenses = foundBudget.expenses.splice(expenseIndex, 1);
      foundBudget.available += deletedExpenses[0].amount;
      return this.repository.update(foundBudget);
    }

    return false;
  }

  /**
   * Update an expense in the budget line and update the available field
   * @param {string} expenseId the expense identifier
   * @returns {boolean} true the expense and the budget have been updated, false otherwise
   */
  async updateExpense(expenseId) {
    const foundExpenses = await this.expenseRepository.find({ _id: expenseId });
    if (foundExpenses.length === 0) {
      return false;
    }

    const updatedExpenses = foundExpenses[0];

    const foundBudget = await this.repository.findOneById(updatedExpenses.budgetLine._id);

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense) => expense._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return false;
    }
    const expenseToUpdate = foundBudget.expenses[expenseIndex];

    const amountDiff = expenseToUpdate.amount - updatedExpenses.amount;

    expenseToUpdate.name = updatedExpenses.name;
    expenseToUpdate.amount = updatedExpenses.amount;
    expenseToUpdate.date = updatedExpenses.date;

    foundBudget.available += amountDiff;
    foundBudget.expenses[expenseIndex] = expenseToUpdate;

    return this.repository.update(foundBudget);
  }
}

module.exports = BudgetService;
