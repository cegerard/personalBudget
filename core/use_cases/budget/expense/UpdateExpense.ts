import { expenseInfo, writeBudgetComplete } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../../interfaces/expense/ExpenseRepository';

export default class UpdateExpense {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;
  private expenseId: string;
  private userId: string;

  constructor(
    expenseId: string,
    userId: string,
    budgetRepository: BudgetRepository,
    expenseRepository: ExpenseRepository
  ) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
    this.expenseId = expenseId;
    this.userId = userId;
  }

  async update(): Promise<boolean> {
    const foundExpenses = await this.expenseRepository.find(this.userId, { _id: this.expenseId });
    if (foundExpenses.length === 0) {
      return false;
    }

    const updatedExpense = foundExpenses[0];

    const foundBudget = await this.repository.findOneById(this.userId, updatedExpense.budgetLine._id);

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense: expenseInfo) => expense._id.toString() === this.expenseId
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

    return this.repository.update(foundBudget as writeBudgetComplete);
  }
}
