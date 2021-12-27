import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BalanceRepository } from "../../../core/interfaces/balance/BalanceRepository";
import { User } from "../../../core/User";
import { GetBalanceAmount } from '../../../core/use_cases/balance/GetBalanceAmout';

export class BalanceController {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  public async get(req: Request, res: Response) {
    const owner = req.user! as User;

    const balance = await new GetBalanceAmount(this.balanceRepository).get(owner.id);
    return res.render('balance', { page: 'balance', balance });
  }
}