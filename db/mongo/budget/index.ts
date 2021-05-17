import mongoose from 'mongoose';

import budgetSchema from './budget.schema';

export default mongoose.model('Budget', budgetSchema);
