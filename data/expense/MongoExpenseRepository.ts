import { deleteQuery, expenseQuery, lightExpense, patchableAttributes, readExpenseInfo, writeExpense } from '../../core/@types/expense/types';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository'

export default class MongoExpenseRepository implements ExpenseRepository {
  private ExpenseModel: any;

  constructor(modelClass: any) {
    this.ExpenseModel = modelClass;
  }

  find(query?: expenseQuery): Promise<readExpenseInfo[]> {
    // TODO: convert to readExpense array
    return this.ExpenseModel.find(query);
  }

  create(expenseValue: writeExpense): Promise<lightExpense> {
    const newExpense = new this.ExpenseModel(expenseValue);
    // TODO convert to light expense
    return newExpense.save();
  }

  async delete(query: deleteQuery): Promise<boolean> {
    const res = await this.ExpenseModel.remove(query);
    return res.deletedCount > 0;
  }

  async patch(expenseId: string, attributes: patchableAttributes): Promise<boolean> {
    const res = await this.ExpenseModel.updateOne({ _id: expenseId }, attributes);
    return res.n === 1;
  }
}
