import {
  attributesToPatch,
  readBudgetComplete,
  readBudgetInfo,
  writeBudget,
  writeBudgetComplete,
} from '../../@types/budget/types';

export default interface BudgetRepository {
  find(selectedFields?: string[]): Promise<readBudgetInfo[]>;
  findOneById(budgetId: string, selectedFields?: string[]): Promise<readBudgetComplete>;
  create(newBudget: writeBudget): Promise<void>;
  delete(budgetId: string): Promise<boolean>;
  patch(budgetId: string, attributes: attributesToPatch): Promise<boolean>;
  update(budget: writeBudgetComplete): Promise<boolean>;
}
