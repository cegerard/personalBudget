import mongoose from 'mongoose';

const balanceSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true }
});

export default balanceSchema;