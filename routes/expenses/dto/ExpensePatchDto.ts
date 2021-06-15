import { patchableAttributes } from "../../../core/@types/expense/types";

export default class ExpensePatchDto {

  private _name: string;
  private _amount: number;
  private _date: string;
  private _id: string;


  constructor(expenseId: string, attributes: any) {
    this._name = attributes.name;
    this._amount = attributes.amount;
    this._date = attributes.date;
    this._id = expenseId;
  }

  public get id(): string {
    return this._id;
  }

  public attributes(): patchableAttributes {
    return {
      name: this._name,
      amount: this._amount,
      date: this._date,
    }
  }
  
}