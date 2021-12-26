import { BalanceRepository } from "../../interfaces/balance/BalanceRepository";

export class GetBalanceAmount {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  public async get(userId: string): Promise<number> {
    const balance = await this.balanceRepository.getBalance(userId);
    return balance?.amount || 0;
  }
}