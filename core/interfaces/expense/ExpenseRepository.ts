import {
  deleteQuery,
  expenseQuery,
  lightExpense,
  patchableAttributes,
  readExpenseInfo,
  writeExpense,
} from '../../@types/expense/types';

export default interface ExpenseRepository {
  find(userId: string, query?: expenseQuery): Promise<readExpenseInfo[]>;
  create(newExpense: writeExpense): Promise<lightExpense>;
  delete(query: deleteQuery): Promise<boolean>;
  patch(expenseId: string, attributes: patchableAttributes): Promise<boolean>;
}
