import { expenseInfo } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../../interfaces/expense/ExpenseRepository';

export default class UpdateExpense {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;
  private expenseId: string;

  constructor(
    expenseId: string,
    budgetRepository: BudgetRepository,
    expenseRepository: ExpenseRepository
  ) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
    this.expenseId = expenseId;
  }

  async update(): Promise<boolean> {
    const foundExpenses = await this.expenseRepository.find({ _id: this.expenseId });
    if (foundExpenses.length === 0) {
      return false;
    }

    const updatedExpense = foundExpenses[0];

    const foundBudget = await this.repository.findOneById(updatedExpense.budgetLine._id);

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

    return this.repository.update(foundBudget);
  }
}
