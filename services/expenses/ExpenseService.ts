import { patchableAttributes } from '../../core/@types/expense/types';
import ExpenseRepository from '../../core/interfaces/expense/ExpenseRepository';

export default class ExpenseService {
  private repository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.repository = expenseRepository;
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
