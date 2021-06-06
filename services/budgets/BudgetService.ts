import slugify from 'slugify';
import { patchableAttributes } from '../../core/@types/types';
import { Budget } from '../../core/Budget';

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

  create(newBudget: Budget) {
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

  async patch(budgetId: string, attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: any = Object.assign({}, attributes);

    if (attributesToPatch.name !== undefined) {
      attributesToPatch.slug = slugify(attributesToPatch.name, { lower: true });
    }

    if (attributesToPatch.amount !== undefined && attributesToPatch.available === undefined) {
      const budget = await this.repository.findOneById(budgetId);

      if (budget === undefined) {
        return false;
      }

      const amountDiff = attributesToPatch.amount - budget.amount;
      attributesToPatch.available = budget.available + amountDiff;
    }

    return this.repository.patch(budgetId, attributesToPatch);
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
