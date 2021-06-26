import { expenseInfo } from '../../../@types/budget/types';
import BudgetRepository from '../../../interfaces/budget/BudgetRepository';

export default class AddExpense {
  private repository: BudgetRepository;
  private budgetId: string;

  constructor(budgetId: string, budgetRepository: BudgetRepository) {
    this.budgetId = budgetId;
    this.repository = budgetRepository;
  }

  async add(expense: expenseInfo): Promise<boolean> {
    // TODO adapt expense to BudgetExpense sub-model
    const foundBudget = await this.repository.findOneById(this.budgetId);
    foundBudget.expenses.push(expense);
    foundBudget.available = this.substractFloat(foundBudget.available, expense.amount);

    return this.repository.update(foundBudget);
  }

  private substractFloat(base: number, toSubstract: number): number {
    return +(base - toSubstract).toFixed(2);
  }
}
