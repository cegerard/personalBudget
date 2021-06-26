import { deleteQuery, expenseQuery, lightExpense, patchableAttributes, readExpenseInfo, writeExpense } from '../../core/@types/expense/types';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';

export default class ExpenseService {
  private repository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.repository = expenseRepository;
  }

  list(): Promise<readExpenseInfo[]> {
    return this.repository.find();
  }

  search(query: expenseQuery): Promise<readExpenseInfo[]> {
    return this.repository.find(query);
  }

  add(expense: writeExpense): Promise<lightExpense> {
    return this.repository.create(expense);
  }

  remove(query: deleteQuery): Promise<boolean> {
    return this.repository.delete(query);
  }

  // TODO: move to use cases
  async patch(expenseId: string, attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: any = Object.assign({}, attributes);

    if (attributesToPatch.amount !== undefined) {
      attributesToPatch.amount = Number(attributesToPatch.amount);
    }

    return this.repository.patch(expenseId, attributes);
  }
}

module.exports = ExpenseService;
