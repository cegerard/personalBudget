import { owner } from '../user/types';

export type budgetType = 'NORMAL' | 'RESERVE';

export type patchableAttributes = {
  name?: string;
  amount?: number;
  description?: string;
  category?: string;
  type?: budgetType;
  available?: number;
  expenses?: expenseInfo[];
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
  owner: owner;
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

export type renewStatus = 'SUCCESS' | 'FAILURE';

export type readBudgetSimple = {
  _id: string;
  name: string;
};

export type renewResponse = {
  status: renewStatus;
  renewedSuccess: readBudgetSimple[];
  renewedFaillure: readBudgetSimple[];
};
