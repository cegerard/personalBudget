import slugify from 'slugify';

import BudgetRepository from '../../data/budget/BudgetRespository';
import ExpenseRepository from '../../data/expense/ExpenseRepository';

export default class BudgetService {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  list(select: string[]) {
    return this.repository.find(select);
  }

  getById(budgetId: string, select: string[]) {
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
  create(newBudget: any) {
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

  async remove(budgetId: string) {
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
   * @param {number} attributes.available
   * @return {boolean} true if the budget has been udpated, false otherwise
   */
  async patch(budgetId: string, attributes: any) {
    if (attributes.name !== undefined) {
      attributes.slug = slugify(attributes.name, { lower: true });
    }

    if (attributes.amount !== undefined && attributes.available === undefined) {
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
  async addExpense(budgetId: string, expense: any) {
    // TODO adapt expense to BudgetExpense sub-model
    const foundBudget = await this.repository.findOneById(budgetId);
    foundBudget.expenses.push(expense);
    // compute available field
    foundBudget.available = this.substractFloat(foundBudget.available, expense.amount);

    return this.repository.update(foundBudget);
  }

  /**
   * Remove expense from an existing budget
   * @param {string} budgetId
   * @param {string} expenseId
   */
  async removeExpense(budgetId: string, expenseId: string) {
    const foundBudget = await this.repository.findOneById(budgetId);
    if (!foundBudget) {
      return false;
    }

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense: any) => expense._id.toString() === expenseId
    );
    if (expenseIndex !== -1) {
      const deletedExpenses = foundBudget.expenses.splice(expenseIndex, 1);
      foundBudget.available += deletedExpenses[0].amount;
      return this.repository.update(foundBudget);
    }

    return true;
  }

  async updateExpense(expenseId: string) {
    const foundExpenses = await this.expenseRepository.find({ _id: expenseId });
    if (foundExpenses.length === 0) {
      return false;
    }

    const updatedExpenses = foundExpenses[0];

    const foundBudget = await this.repository.findOneById(updatedExpenses.budgetLine._id);

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense: any) => expense._id.toString() === expenseId
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

  private substractFloat(base: number, toSubstract: number) {
    return +(base - toSubstract).toFixed(2);
  }
}
