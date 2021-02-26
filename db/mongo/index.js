'use strict';

const mongoose = require('mongoose');

const budgetModel = require('./budget');
const expenseModel = require('./expense');

function connectMongo() {
  const USER = process.env.USER;
  const PASSWORD = process.env.PASSWORD;
  const DB = process.env.DB;
  mongoose.connect(
    `mongodb+srv://${USER}:${PASSWORD}@dev.hw9tl.azure.mongodb.net/${DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
}

module.exports = {
  connectDb: connectMongo,
  budgetModel,
  expenseModel
}
