#! /app/.heroku/node/bin/node

// At the first of each month we reset all NORMAL budgets back to there amount level,
// for RESERVE budget we accumulate the amount over month.
// Each budget is clear from its expenses.
// Expenses are not deleted.

import RenewBudgets from '../core/use_cases/budget/RenewBudgets';
import { connectDb, disconnectDb, MongoAdminBudgetRepository } from '../db/mongo';

console.log('Starts renew budgets task');
execute();

async function execute() {
  console.log('Connecting database...');
  await connectDb();

  console.log('Renew budgets');
  const budgetRepository = new MongoAdminBudgetRepository();
  const useCase = new RenewBudgets(budgetRepository);
  const result = await useCase.renewAll();

  console.log('List of updated budgets:');
  result.renewedSuccess.forEach((budget) => {
    console.log(`${budget.name}(${budget._id})`);
  });

  if (result.status === 'SUCCESS') {
    console.log('\nAll budgets are successfuly renewed.');
  } else {
    console.log('\nThere is some errors renewing budgets');
    console.log('See the budget update that failed below:');
    result.renewedFaillure.forEach((budget) => {
      console.log(`${budget.name}(${budget._id})`);
    });
  }

  await disconnectDb();
  console.log('End of renew budgets task');
}
