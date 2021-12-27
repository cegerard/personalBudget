import express from 'express';
import { BalanceController } from './controller';

const Router = express.Router;

function init(controller: BalanceController) {
  const router = Router();

  router.get('/', controller.get.bind(controller));

  return router;
}

export default { init };
