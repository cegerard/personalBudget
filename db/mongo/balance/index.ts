import mongoose from 'mongoose';

import balanceSchema from './balance.schema';

export default mongoose.model('Balance', balanceSchema);