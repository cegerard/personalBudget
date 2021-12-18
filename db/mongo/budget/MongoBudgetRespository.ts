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
  find(userId: string, selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    // TODO: convert to readBudget array
    return budgetModel.find({'owner.id': userId}, selectedFields);
  }

  async findOneById(userId: string, budgetId: string, selectedFields: string[] = []): Promise<readBudgetComplete> {
    // TODO: convert to readBudget
    const foundBudget = await budgetModel.find({ 'owner.id': userId, _id: budgetId }, selectedFields);
    return foundBudget[0];
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

  async update(userId: string, budgetToUpdate: writeBudgetComplete): Promise<boolean> {
    const res = await budgetModel.replaceOne({ _id: budgetToUpdate._id, 'owner.id': userId  }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(userId: string, budgetId: string): Promise<boolean> {
    const res = await budgetModel.remove({ _id: budgetId, 'owner.id': userId });
    return res.deletedCount === 1;
  }

  async patch(userId: string, budgetId: string, attributes: attributesToPatch): Promise<boolean> {
    const res = await budgetModel.updateOne({ _id: budgetId, 'owner.id': userId }, attributes);
    return res.n === 1;
  }
}
