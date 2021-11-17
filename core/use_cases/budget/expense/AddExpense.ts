import { expenseInfo, readBudgetComplete } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';

export default class AddExpense {
  private repository: BudgetRepository;
  private budget: readBudgetComplete;

  constructor(budget: readBudgetComplete, budgetRepository: BudgetRepository) {
    this.budget = budget;
    this.repository = budgetRepository;
  }

  async add(expense: expenseInfo): Promise<boolean> {
    // TODO adapt expense to BudgetExpense sub-model
    this.budget.expenses.push(expense);
    this.budget.available = this.substractFloat(this.budget.available, expense.amount);

    return this.repository.update(this.budget);
  }

  private substractFloat(base: number, toSubstract: number): number {
    return +(base - toSubstract).toFixed(2);
  }
}
