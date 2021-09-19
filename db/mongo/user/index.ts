import mongoose from 'mongoose';

import userSchema from './user.schema';

export default mongoose.model('User', userSchema);
