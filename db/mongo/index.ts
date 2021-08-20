import mongoose from 'mongoose';

import MongoBudgetRepository from './budget/MongoBudgetRespository';
import MongoExpenseRepository from './expense/MongoExpenseRepository';

function connectMongo() {
  const USER = process.env.USER;
  const PASSWORD = process.env.PASSWORD;
  const DB = process.env.DB;
  return mongoose.connect(
    `mongodb+srv://${USER}:${PASSWORD}@dev.hw9tl.azure.mongodb.net/${DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
}

function disconnectMongo() {
  return mongoose.disconnect();
}

export {
  connectMongo as connectDb,
  disconnectMongo as disconnectDb,
  MongoBudgetRepository,
  MongoExpenseRepository,
};
