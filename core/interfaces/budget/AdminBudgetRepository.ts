import { readBudgetInfo } from '../../@types/budget/types';

export default interface AdminBudgetRepository {
  findAll(selectedFields?: string[]): Promise<readBudgetInfo[]>;
  renew(budgetId: string, available: number, expenses: unknown[]): Promise<boolean>;
}
