import { ReadBalance } from '../../../core/@types/balance/types';
import { BalanceRepository } from '../../../core/interfaces/balance/BalanceRepository';
import Balance from '.';

export default class MongoBalanceRepository implements BalanceRepository {
  public async getBalance(userId: string): Promise<ReadBalance | undefined> {
    const balance = await Balance.findOne({ userId });

    if(balance) {
      return {
        amount: balance.amount,
        userId: balance.userId,
      };
    }

    return;
  }

  public async setAmount(userId: string, amount: number): Promise<boolean> {
    let balance = await Balance.findOne({ userId });

    if (balance) {
      balance.amount = amount;
    } else {
      balance = new Balance();
      balance.userId = userId;
      balance.amount = amount;
    }

    const newBalance = await balance.save();
    return newBalance.amount === amount;
  }
}
