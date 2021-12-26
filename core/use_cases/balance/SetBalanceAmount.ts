import { BalanceRepository } from "../../interfaces/balance/BalanceRepository";

export class SetBalanceAmount {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  public async set(userId: string, amount: number): Promise<void> {
    this.balanceRepository.setAmount(userId, amount);
  }
}