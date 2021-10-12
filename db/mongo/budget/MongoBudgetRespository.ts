import {
  attributesToPatch,
  readBudgetComplete,
  readBudgetInfo,
  writeBudget,
  writeBudgetComplete,
} from '../../../core/@types/budget/types';
import BudgetRepository from '../../../core/interfaces/budget/BudgetRepository';
import budgetModel from '.';

export default class MongoBudgetRepository implements BudgetRepository {
  find(selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    // TODO: convert to readBudget array
    return budgetModel.find({}, selectedFields);
  }

  findOneById(budgetId: string, selectedFields: string[] = []): Promise<readBudgetComplete> {
    // TODO: convert to readBudget
    return budgetModel.findById(budgetId, selectedFields);
  }

  async create(budget: writeBudget): Promise<void> {
    const createBudget = new budgetModel({
      name: budget.name,
      slug: budget.slug,
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
      category: budget.category,
      type: budget.type,
      owner: budget.owner,
    });
    await createBudget.save();
    return Promise.resolve();
  }

  async update(budgetToUpdate: writeBudgetComplete): Promise<boolean> {
    const res = await budgetModel.replaceOne({ _id: budgetToUpdate._id }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(budgetId: string): Promise<boolean> {
    const res = await budgetModel.remove({ _id: budgetId });
    return res.deletedCount === 1;
  }

  async patch(budgetId: string, attributes: attributesToPatch): Promise<boolean> {
    const res = await budgetModel.updateOne({ _id: budgetId }, attributes);
    return res.n === 1;
  }
}
