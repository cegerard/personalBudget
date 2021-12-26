import { ReadBalance } from '../../core/@types/balance/types';
import { BalanceRepository } from '../../core/interfaces/balance/BalanceRepository';

export class BalanceRepositoryStub implements BalanceRepository {
  private amount: number;

  constructor() {
    this.amount = 0;
  }

  public async getBalance(userId: string): Promise<ReadBalance> {
    return {
      amount: this.amount,
      userId: userId,
    };
  }

  public async setAmount(_: string, amount: number): Promise<boolean> {
    this.amount = amount;
    return true;
  }

  public reset(amount: number): void {
    this.amount = amount;
  }

}