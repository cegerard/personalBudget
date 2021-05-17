export default class ExpenseRepository {
  private ExpenseModel: any;

  constructor(modelClass: any) {
    this.ExpenseModel = modelClass;
  }

  find(query: any) {
    return this.ExpenseModel.find(query);
  }

  create(expenseValue: any) {
    const newExpense = new this.ExpenseModel(expenseValue);
    return newExpense.save();
  }

  async delete(query: any) {
    const res = await this.ExpenseModel.remove(query);
    return res.deletedCount > 0;
  }

  async patch(expenseId: string, attributes: any) {
    const res = await this.ExpenseModel.updateOne({ _id: expenseId }, attributes);
    return res.n === 1;
  }
}
