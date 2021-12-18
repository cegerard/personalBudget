import {
  deleteQuery,
  expenseQuery,
  lightExpense,
  patchableAttributes,
  readExpenseInfo,
  writeExpense,
} from '../../@types/expense/types';

export default interface ExpenseRepository {
  create(newExpense: writeExpense): Promise<lightExpense>;
  find(userId: string, query?: expenseQuery): Promise<readExpenseInfo[]>;
  patch(userId:string, expenseId: string, attributes: patchableAttributes): Promise<boolean>;
  delete(userId: string, query: deleteQuery): Promise<boolean>;
}
