import slugify from 'slugify';
import {
  attributesToPatch,
  expenseInfo,
  patchableAttributes,
} from '../../core/@types/budget/types';
import { Budget } from '../../core/Budget';
import BudgetRepository from '../../core/interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';

export default class BudgetService {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }


  // TODO: move to use cases
  create(newBudget: Budget): Promise<void> {
    return this.repository.create({
      name: newBudget.name,
      slug: slugify(newBudget.name, { lower: true }),
      amount: newBudget.amount,
      description: newBudget.description,
      category: newBudget.category,
      type: newBudget.type,
    });
  }

  // TODO: move to use cases
  async remove(budgetId: string): Promise<boolean> {
    const isDeleted = await this.repository.delete(budgetId);
    if (isDeleted) {
      this.expenseRepository.delete({ 'budgetLine._id': budgetId });
    }
    return isDeleted;
  }

  // TODO: move to use cases
  async patch(budgetId: string, attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: attributesToPatch = Object.assign({}, attributes);

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

  // TODO: move to use cases
  async addExpense(budgetId: string, expense: expenseInfo): Promise<boolean> {
    // TODO adapt expense to BudgetExpense sub-model
    const foundBudget = await this.repository.findOneById(budgetId);
    foundBudget.expenses.push(expense);
    // compute available field
    foundBudget.available = this.substractFloat(foundBudget.available, expense.amount);

    return this.repository.update(foundBudget);
  }

  // TODO: move to use cases
  async removeExpense(budgetId: string, expenseId: string): Promise<boolean> {
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

  // TODO: move to use cases
  async updateExpense(expenseId: string): Promise<boolean> {
    const foundExpenses = await this.expenseRepository.find({ _id: expenseId });
    if (foundExpenses.length === 0) {
      return false;
    }

    const updatedExpense = foundExpenses[0];

    const foundBudget = await this.repository.findOneById(updatedExpense.budgetLine._id);

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense: expenseInfo) => expense._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return false;
    }
    const expenseToUpdate = foundBudget.expenses[expenseIndex];

    const amountDiff = expenseToUpdate.amount - updatedExpense.amount;

    expenseToUpdate.name = updatedExpense.name;
    expenseToUpdate.amount = updatedExpense.amount;
    expenseToUpdate.date = updatedExpense.date;

    foundBudget.available += amountDiff;
    foundBudget.expenses[expenseIndex] = expenseToUpdate;

    return this.repository.update(foundBudget);
  }

  private substractFloat(base: number, toSubstract: number): number {
    return +(base - toSubstract).toFixed(2);
  }
}
