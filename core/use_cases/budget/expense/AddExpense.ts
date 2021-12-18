import { expenseInfo, readBudgetComplete, writeBudgetComplete } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';

export default class AddExpense {
  private repository: BudgetRepository;
  private budget: readBudgetComplete;
  private userId: string;

  constructor(budget: readBudgetComplete, userId: string, budgetRepository: BudgetRepository) {
    this.budget = budget;
    this.repository = budgetRepository;
    this.userId = userId;
  }

  async add(expense: expenseInfo): Promise<boolean> {
    // TODO adapt expense to BudgetExpense sub-model
    this.budget.expenses.push(expense);
    this.budget.available = this.substractFloat(this.budget.available, expense.amount);

    return this.repository.update(this.userId, this.budget as writeBudgetComplete);
  }

  private substractFloat(base: number, toSubstract: number): number {
    return +(base - toSubstract).toFixed(2);
  }
}
