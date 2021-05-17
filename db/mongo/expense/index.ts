import mongoose from 'mongoose';

import expenseSchema from './expense.schema';

export default mongoose.model('Expense', expenseSchema);
