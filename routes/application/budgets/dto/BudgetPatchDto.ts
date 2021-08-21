import { budgetType, patchableAttributes } from '../../../../core/@types/budget/types';

export default class BudgetPatchDto {
  private _id: string;
  private _name?: string;
  private _amount?: number;
  private _description?: string;
  private _category?: string;
  private _type?: budgetType;
  private _available?: number;

  constructor(id: string, attributes: any) {
    this._id = id;
    this._name = attributes.name;
    this._amount = attributes.amount;
    this._description = attributes.description;
    this._type = attributes.type;
    this._category = attributes.category;

    if (attributes.available) {
      this._available = +attributes.available;
    }
  }

  public get id(): string {
    return this._id;
  }

  public attributes(): patchableAttributes {
    return {
      name: this._name!,
      amount: this._amount!,
      description: this._description!,
      category: this._category!,
      type: this._type!,
      available: this._available!,
    };
  }
}
