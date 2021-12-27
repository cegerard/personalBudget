import { ReadBalance } from '../../core/@types/balance/types';
import { BalanceRepository } from '../../core/interfaces/balance/BalanceRepository';

export class BalanceRepositoryStub implements BalanceRepository {
  private amount: number;
  private userId: string;

  constructor() {
    this.amount = 0;
    this.userId = '';
  }

  public async getBalance(userId: string): Promise<ReadBalance | undefined> {
    if (userId === this.userId) {
      return {
        amount: this.amount,
        userId: userId,
      };
    }

    return undefined;
  }

  public async setAmount(userId: string, amount: number): Promise<boolean> {
    this.amount = amount;
    this.userId = userId;
    return true;
  }

  public reset(amount: number, userId: string): void {
    this.amount = amount;
    this.userId = userId;
  }
}
