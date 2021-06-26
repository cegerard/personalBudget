import BudgetRepository from '../../interfaces/budget/BudgetRepository';
import ExpenseRepository from '../../interfaces/expense/ExpenseRepository';

export default class BudgetService {
  private repository: BudgetRepository;
  private expenseRepository: ExpenseRepository;

  constructor(budgetRepository: BudgetRepository, expenseRepository: ExpenseRepository) {
    this.repository = budgetRepository;
    this.expenseRepository = expenseRepository;
  }

  async remove(budgetId: string): Promise<boolean> {
    // TODO: look for transaction mechanism
    const isDeleted = await this.repository.delete(budgetId);
    if (isDeleted) {
      this.expenseRepository.delete({ 'budgetLine._id': budgetId });
    }
    return isDeleted;
  }
}
