import { patchableAttributes } from '../../@types/expense/types';
import ExpenseRepository from '../../interfaces/expense/ExpenseRepository';

export default class UpdateExpense {
  private expenseId: string;
  private repository: ExpenseRepository;
  private userId: string;

  constructor(expenseId: string, userId: string, expenseRepository: ExpenseRepository) {
    this.expenseId = expenseId;
    this.repository = expenseRepository;
    this.userId = userId;
  }

  async update(attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: any = Object.assign({}, attributes);

    if (attributesToPatch.amount !== undefined) {
      attributesToPatch.amount = Number(attributesToPatch.amount);
    }

    return this.repository.patch(this.userId, this.expenseId, attributes);
  }
}

module.exports = UpdateExpense;
