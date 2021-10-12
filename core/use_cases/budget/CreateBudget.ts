import slugify from 'slugify';

import { Budget } from '../../Budget';
import { User } from '../../User';
import BudgetRepository from '../../interfaces/budget/BudgetRepository';

export default class CreateBudget {
  private repository: BudgetRepository;

  constructor(budgetRepository: BudgetRepository) {
    this.repository = budgetRepository;
  }

  create(newBudget: Budget, user: User): Promise<void> {
    const slug = this.generateslug(newBudget.name);

    return this.repository.create({
      slug,
      name: newBudget.name,
      amount: newBudget.amount,
      description: newBudget.description,
      category: newBudget.category,
      type: newBudget.type,
      owner: {
        id: user.id,
        name: user.fullName,
      },
    });
  }

  private generateslug(attribute: string) {
    return slugify(attribute, { lower: true });
  }
}
