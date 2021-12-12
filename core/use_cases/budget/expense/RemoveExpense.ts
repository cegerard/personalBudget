import { writeBudgetComplete } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';

export default class RemoveExpense {
  private repository: BudgetRepository;
  private budgetId: string;
  private userId: string;

  constructor(budgetId: string, userId: string, budgetRepository: BudgetRepository) {
    this.budgetId = budgetId;
    this.userId = userId;
    this.repository = budgetRepository;
  }

  async remove(expenseId: string): Promise<boolean> {
    const foundBudget = await this.repository.findOneById(this.userId, this.budgetId);
    if (!foundBudget) {
      return false;
    }

    const expenseIndex = foundBudget.expenses.findIndex(
      (expense: any) => expense._id.toString() === expenseId
    );
    if (expenseIndex !== -1) {
      const deletedExpenses = foundBudget.expenses.splice(expenseIndex, 1);
      foundBudget.available += deletedExpenses[0].amount;
      return this.repository.update(foundBudget as writeBudgetComplete);
    }

    return true;
  }
}
