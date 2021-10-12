import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

const OwnerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
});

const budgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  available: { type: Number, required: true },
  type: {
    type: String,
    enum: ['NORMAL', 'RESERVE'],
    default: 'NORMAL',
    require: true,
  },
  expenses: { type: [ExpenseSchema], default: [] },
  category: { type: String },
  owner: { type: OwnerSchema, required: true },
});

export default budgetSchema;
