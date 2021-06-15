type baseExpense = {
  name: string,
  amount: number,
  date: Date,
}

export default class ExpenseCreateDto {

  private _name: string;
  private _amount: number;
  private _date: Date;
  private _budgetLineId: string;


  constructor(expenseToCreate: any) {
    this._name = expenseToCreate.name;
    this._amount = expenseToCreate.amount;
    this._date = expenseToCreate.date;
    this._budgetLineId = expenseToCreate.budgetlineId;
  }

  public get budgetLineId(): string {
    return this._budgetLineId;
  }

  public baseExpense(): baseExpense {
    return {
      name: this._name,
      amount: this._amount,
      date: this._date,
    }
  }
  
}