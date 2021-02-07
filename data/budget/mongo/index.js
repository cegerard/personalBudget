const mongoose = require('mongoose');

const budgetSchema = require('./budget.schema');

module.exports = mongoose.model('Budget', budgetSchema);;