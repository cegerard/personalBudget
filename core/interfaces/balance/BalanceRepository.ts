import { ReadBalance } from "../../@types/balance/types";

export interface BalanceRepository {
  getBalance(userId: string): Promise<ReadBalance | undefined>;
  setAmount(userId: string, amount: number): Promise<boolean>;
}