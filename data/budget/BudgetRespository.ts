export default class BudgetRepository {
  private BudgetModel: any;

  constructor(modelClass: any) {
    this.BudgetModel = modelClass;
  }

  find(selectedFields: string[] = []) {
    return this.BudgetModel.find({}, selectedFields);
  }

  findOneById(budgetId: string, selectedFields: string[] = []) {
    return this.BudgetModel.findById(budgetId, selectedFields);
  }

  create(budget: any) {
    const createBudget = new this.BudgetModel({
      name: budget.name,
      slug: budget.slug,
      amount: budget.amount,
      description: budget.description,
      available: budget.amount,
      expenses: [],
      category: budget.category,
      type: budget.type,
    });
    return createBudget.save();
  }

  async update(budgetToUpdate: any) {
    const res = await this.BudgetModel.replaceOne({ _id: budgetToUpdate._id }, budgetToUpdate);
    return res.nModified === 1;
  }

  async delete(budgetId: string) {
    const res = await this.BudgetModel.remove({ _id: budgetId });
    return res.deletedCount === 1;
  }

  async patch(budgetId: string, attributes: any): Promise<boolean> {
    const res = await this.BudgetModel.updateOne({ _id: budgetId }, attributes);
    return res.n === 1;
  }
}
