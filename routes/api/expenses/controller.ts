import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '../../../core/User';

import ExpenseRepository from '../../../core/interfaces/expense/ExpenseRepository';

export default class ApiExpenseController {
  private expenseRepository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async findById(req: Request, res: Response) {
    const owner = req.user! as User;

    const expenses = await this.expenseRepository.find(owner.id, { _id: req.params.id });

    if (expenses.length > 0) {
      res.send(expenses[0]);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }
}
