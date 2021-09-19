import express from 'express';
import passport from 'passport';

import HomeController from './controllers';
import Authentication from '../../../lib/security/authentication'


const Router = express.Router;

function init(controller: HomeController) {
  const router = Router();

  router.get('/', Authentication.forwardAuthenticated, controller.get.bind(controller));
  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/budgets',
      failureRedirect: '/',
      failureFlash: false,
    })
  );
  router.get('/sign_up', controller.signUpForm.bind(controller));
  router.post('/sign_up', controller.signUp.bind(controller));

  return router;
}

export default { init };
