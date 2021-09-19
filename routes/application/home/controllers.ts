import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import UserRepository from '../../../core/interfaces/user/UserRepository';
import { UserCredential } from '../../../core/UserCredential';

export default class HomeController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  get(_: Request, res: Response) {
    res.render('home');
  }

  public signUpForm(_: Request, res: Response) {
    res.render('signup');
  }

  public async signUp(req: Request, res: Response, next: any) {
    const userData = req.body;

    if (!userData.password || userData.password !== userData.password2) {
      return res.redirect(StatusCodes.BAD_REQUEST, '/sign_up');
    }

    const existingUser = await this.userRepository.findByEmail(userData.email);
    if(existingUser) {
      return res.redirect(StatusCodes.CONFLICT, '/sign_up');
    }

    const cryptedPassword = UserCredential.cipher(userData.password);
    const user = await this.userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: cryptedPassword,
    });    

    req.login(user, (_) => { return res.redirect('/budgets'); });
  }
}
