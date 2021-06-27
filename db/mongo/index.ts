import mongoose from 'mongoose';

import expenseModel from './expense';
import MongoBudgetRepository from './budget/MongoBudgetRespository';
import MongoExpenseRepository from './expense/MongoExpenseRepository';
import migrate from './migration';

async function connectMongo() {
  const USER = process.env.USER;
  const PASSWORD = process.env.PASSWORD;
  const DB = process.env.DB;
  await mongoose.connect(
    `mongodb+srv://${USER}:${PASSWORD}@dev.hw9tl.azure.mongodb.net/${DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  migrate();
}

function disconnectMongo() {
  mongoose.disconnect();
}

export {
  connectMongo as connectDb,
  disconnectMongo as disconnectDb,
  expenseModel,
  MongoBudgetRepository,
  MongoExpenseRepository,
};
