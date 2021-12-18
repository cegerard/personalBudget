import {
  attributesToPatch,
  readBudgetComplete,
  readBudgetInfo,
  writeBudget,
  writeBudgetComplete,
} from '../../@types/budget/types';

export default interface BudgetRepository {
  create(newBudget: writeBudget): Promise<void>;
  find(userId: string, selectedFields?: string[]): Promise<readBudgetInfo[]>;
  findOneById(userId: string, budgetId: string): Promise<readBudgetComplete>;
  delete(userId: string, budgetId: string): Promise<boolean>;
  patch(userId: string, budgetId: string, attributes: attributesToPatch): Promise<boolean>;
  update(userId: string, budget: writeBudgetComplete): Promise<boolean>;
}
