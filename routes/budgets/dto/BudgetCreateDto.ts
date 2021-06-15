import { budgetType } from '../../../core/@types/budget/types';
import { Budget } from '../../../core/Budget'

export default class BudgetCreateDto {
  private name: string;
  private amount: number;
  private description: string;
  private category: string;
  private type: budgetType;

  constructor(budgetToCreate: any) {
    this.name = budgetToCreate.name;
    this.amount = budgetToCreate.amount;
    this.description = budgetToCreate.description;
    this.category = budgetToCreate.category;
    this.type = budgetToCreate.type;
  }

  toBudget(): Budget {
    return new Budget(this.name, this.amount, this.description, this.type, this.category);
  }

}