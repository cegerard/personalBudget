import { budgetType } from "./@types/types";

export class Budget {
  private readonly _name: string;
  private readonly _amount: number;
  private readonly _description: string;
  private readonly _type: budgetType;
  private readonly _category?: string;

  constructor(name: string, amount: number, description: string, type: budgetType = 'NORMAL', category?: string) {
    this._name = name;
    this._amount = amount;
    this._description = description;
    this._type = type;
    this._category = category!;
  }


  public get name() {
    return this._name;
  } 

  public get amount() {
    return this._amount;
  } 

  public get description() {
    return this._description;
  }
  
  public get category() {
    return this._category;
  } 
  
  public get type() {
    return this._type;
  } 
}