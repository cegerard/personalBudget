'use strict';

const budgetModel = require('../budget');

module.exports = async () => {
  console.log('    ------------');
  console.log('Start data migrations');
  // Add migration function script below
  await setDefaultBudgetType();
  // end of migrations scripts
  console.log('Data migration successful');
  console.log('    ------------');
}

async function setDefaultBudgetType() {
  console.log('  Set default budgets type');
  const res = await budgetModel.updateMany({ type: undefined }, { type: 'NORMAL' });
  console.log(`  ${res.nModified} updated document(s)`);
  console.log('  Default budget type set');
}
