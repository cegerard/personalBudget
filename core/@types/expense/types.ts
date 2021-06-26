export type patchableAttributes = {
  name?: string;
  amount?: number;
  date?: string;
};

export type expenseQuery = {
  _id?: string;
  'budgetLine.name'?: string;
};

export type deleteQuery = {
  _id?: string;
  'budgetLine._id'?: string;
};

export type writeExpense = {
  name: string;
  amount: number;
  date: string;
  budgetLine: {
    _id: string;
    name: string;
  }
};

export type readExpenseInfo = {
  _id: string;
  name: string;
  amount: number;
  date: string;
  budgetLine: {
    _id: string;
    name: string;
  }
};

export type lightExpense = {
  _id: string
}
