export type budgetType = 'NORMAL' | 'RESERVE';

export type patchableAttributes = {
  name?: string,
  amount?: number,
  description?: string,
  category?: string,
  type?: budgetType,
  available?: number,
} 