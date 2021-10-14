import {
  deleteQuery,
  expenseQuery,
  lightExpense,
  patchableAttributes,
  readExpenseInfo,
  writeExpense,
} from '../../../core/@types/expense/types';
import ExpenseRepository from '../../../core/interfaces/expense/ExpenseRepository';
import expenseModel from '.';

export default class MongoExpenseRepository implements ExpenseRepository {
  find(query?: expenseQuery): Promise<readExpenseInfo[]> {
    // TODO: convert to readExpense array
    return expenseModel.find(query as any);
  }

  async create(expenseValue: writeExpense): Promise<lightExpense> {
    const newExpense = new expenseModel(expenseValue);
    // TODO convert to light expense
    const savedExpense = await newExpense.save();
    return Promise.resolve({ _id: savedExpense._id });
  }

  async delete(query: deleteQuery): Promise<boolean> {
    const res = await expenseModel.remove(query);
    return res.deletedCount > 0;
  }

  async patch(expenseId: string, attributes: patchableAttributes): Promise<boolean> {
    const res = await expenseModel.updateOne({ _id: expenseId }, attributes);
    return res.n === 1;
  }
}
