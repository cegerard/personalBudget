import {
  attributesToPatch,
  readBudgetInfo,
} from '../../@types/budget/types';

export default interface AdminBudgetRepository {
  findAll(selectedFields?: string[]): Promise<readBudgetInfo[]>;
  renew(budgetId: string, available: number, expense: unknown[]): Promise<boolean>;
}
