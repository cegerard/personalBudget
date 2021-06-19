export type budgetType = 'NORMAL' | 'RESERVE';

export type patchableAttributes = {
  name?: string;
  amount?: number;
  description?: string;
  category?: string;
  type?: budgetType;
  available?: number;
};

export type readBudgetInfo = {
  _id: string;
  name: string;
  slug: string;
  amount: number;
  available: number;
  type: budgetType;
  description?: string;
  category?: string;
};

export type readBudgetComplete = {
  _id: string;
  name: string;
  slug: string;
  amount: number;
  available: number;
  type: budgetType;
  description?: string;
  category?: string;
  expenses: expenseInfo[];
};

export type writeBudget = {
  name: string;
  slug: string;
  amount: number;
  type: budgetType;
  description: string;
  category?: string;
};

export type writeBudgetComplete = {
  _id: string;
  name: string;
  slug: string;
  amount: number;
  available: number;
  type: budgetType;
  expenses?: expenseInfo[];
  description?: string;
  category?: string;
};

export type attributesToPatch = patchableAttributes & { slug?: string };

export type expenseInfo = {
  _id: string;
  name: string;
  amount: number;
  date: string;
};
