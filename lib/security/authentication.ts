import { Request, Response } from 'express';

export default class Authentication {
  static PASSPHRASE = process.env.PASSPHRASE || 'secret';

  static ensureAuthenticated(req: Request, res: Response, next: any) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

  static forwardAuthenticated(req: Request, res: Response, next: any) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/budgets');
  }
}
