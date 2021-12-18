import BudgetRepository from '../../interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../interfaces/expense/ExpenseRepository';

export default class BudgetService {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  async remove(budgetId: string, userId: string): Promise<boolean> {
    // TODO: look for transaction mechanism
    const isDeleted = await this.repository.delete(userId, budgetId);
    if (isDeleted) {
      this.expenseRepository.delete(userId, { 'budgetLine._id': budgetId });
    }
    return isDeleted;
  }
}
