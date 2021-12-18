import slugify from 'slugify';

import { attributesToPatch, patchableAttributes } from '../../@types/budget/types';
import BudgetRepository from '../../interfaces/budget/BudgetRepository';

export default class UpdateBudget {
  private repository: BudgetRepository;
  private budgetId: string;
  private userId: string;

  constructor(budgetId: string, userId: string, budgetRepository: BudgetRepository) {
    this.repository = budgetRepository;
    this.budgetId = budgetId;
    this.userId = userId;
  }

  async patch(attributes: patchableAttributes): Promise<boolean> {
    const attributesToPatch: attributesToPatch = Object.assign({}, attributes);

    if (attributesToPatch.name !== undefined) {
      attributesToPatch.slug = slugify(attributesToPatch.name, { lower: true });
    }

    if (attributesToPatch.amount !== undefined && attributesToPatch.available === undefined) {
      const budget = await this.repository.findOneById(this.userId, this.budgetId);
      if (budget === undefined) {
        return false;
      }

      const amountDiff = attributesToPatch.amount - budget.amount;
      attributesToPatch.available = budget.available + amountDiff;
    }

    return this.repository.patch(this.userId, this.budgetId, attributesToPatch);
  }
}
