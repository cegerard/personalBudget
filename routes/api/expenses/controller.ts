import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import ExpenseRepository from '../../../core/interfaces/expense/ExpenseRepository';

export default class ApiExpenseController {
  private expenseRepository: ExpenseRepository;

  constructor(expenseRepository: ExpenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async findById(req: Request, res: Response) {
    const expenses = await this.expenseRepository.find({ _id: req.params.id });

    if (expenses.length > 0) {
      res.send(expenses[0]);
    } else {
      res.status(StatusCodes.NOT_FOUND).end();
    }
  }
}
