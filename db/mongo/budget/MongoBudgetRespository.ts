import {
  attributesToPatch,
  readBudgetComplete,
  readBudgetInfo,
  writeBudget,
  writeBudgetComplete,
} from '../../../core/@types/budget/types';
import BudgetRepository from '../../../core/interfaces/budget/BudgetRepository';

export default class MongoBudgetRepository implements BudgetRepository {
  private BudgetModel: any;

  constructor(modelClass: any) {
    this.BudgetModel = modelClass;
  }

  find(selectedFields: string[] = []): Promise<readBudgetInfo[]> {
    // TODO: convert to readBudget array
    return this.BudgetModel.find({}, selectedFields);
  }

  findOneById(budgetId: string, selectedFields: string[] = []): Promise<readBudgetComplete> {
    // TODO: convert to readBudget
    return this.BudgetModel.findById(budgetId, selectedFields);
  }

  create(budget: writeBudget): Promise<void> {
    const createBudget = new this.BudgetModel({
      name: budget.name,
      slug: budget.slug,
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
      category: budget.category,
      type: budget.type,
    });
    return createBudget.save();
  }

  async update(budgetToUpdate: writeBudgetComplete): Promise<boolean> {
    const res = await this.BudgetModel.replaceOne({ _id: budgetToUpdate._id }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(budgetId: string): Promise<boolean> {
    const res = await this.BudgetModel.remove({ _id: budgetId });
    return res.deletedCount === 1;
  }

  async patch(budgetId: string, attributes: attributesToPatch): Promise<boolean> {
    const res = await this.BudgetModel.updateOne({ _id: budgetId }, attributes);
    return res.n === 1;
  }
}
