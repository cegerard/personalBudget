const express = require('express');

const homeRoute = require('./home/routes');
const budgetsRoute = require('./budgets/routes');
const expensesRoute = require('./expenses/routes');

const router = express.Router();

router.use('/', homeRoute);
router.use('/budgets', budgetsRoute);
router.use('/expenses', expensesRoute);

module.exports = router;
