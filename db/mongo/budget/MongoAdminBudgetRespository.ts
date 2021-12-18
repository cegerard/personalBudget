import { readBudgetInfo } from '../../../core/@types/budget/types';
import budgetModel from '.';
import AdminBudgetRepository from '../../../core/interfaces/budget/AdminBudgetRepository';

export default class MongoAdminBudgetRepository implements AdminBudgetRepository {
  async renew(budgetId: string, available: number, expenses: unknown[]): Promise<boolean> {
    const res = await budgetModel.updateOne({ _id: budgetId }, { available, expenses });
    return res.n === 1;
  }

  findAll(selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    // TODO: convert to readBudget array
    return budgetModel.find({}, selectedFields);
  }
}
