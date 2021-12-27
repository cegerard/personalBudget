import MongoDBStore from 'connect-mongodb-session';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import createError from 'http-errors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import path from 'path';
import logger from 'morgan';

import BudgetRepository from './core/interfaces/budget/BudgetRepository';
import ExpenseRepository from './core/interfaces/expense/ExpenseRepository';
import UserRepository from './core/interfaces/user/UserRepository';
import { BalanceRepository } from './core/interfaces/balance/BalanceRepository';
import ApiRouter from './routes/api/ApiRouter';
import AppRouter from './routes/application/AppRouter';
import HomeController from './routes/application/home/controllers';
import BudgetController from './routes/application/budgets/controllers';
import ExpenseController from './routes/application/expenses/controllers';

import BudgetRepositoryStub from './test/stubs/BudgetRepositoryStub';
import ExpenseRepositoryStub from './test/stubs/ExpenseRepositoryStub';
import UserRepositoryStub from './test/stubs/UserRepositoryStub';
import { BalanceRepositoryStub } from './test/stubs/BalanceRepositoryStub';

import { User } from './core/User';
import { UserCredential } from './core/UserCredential';
import {
  connectDb,
  MongoUserRepository,
  MongoBudgetRepository,
  MongoExpenseRepository,
} from './db/mongo';
import ApiExpenseController from './routes/api/expenses/controller';
import { BalanceController } from './routes/application/balance/controller';
import MongoBalanceRepository from './db/mongo/balance/MongoBalanceRepository';

class Application {
  private mode: string;
  private budgetRepository: BudgetRepository;
  private expenseRepository: ExpenseRepository;
  private userRepository: UserRepository;
  private balanceRepository: BalanceRepository;
  public app: any;

  constructor() {
    this.app = express();
    this.mode = this.app.get('env');

    let basePath = __dirname;

    if (this.mode === 'production') {
      connectDb();
      this.budgetRepository = new MongoBudgetRepository();
      this.expenseRepository = new MongoExpenseRepository();
      this.userRepository = new MongoUserRepository();
      this.balanceRepository = new MongoBalanceRepository();
    } else {
      this.budgetRepository = new BudgetRepositoryStub();
      this.expenseRepository = new ExpenseRepositoryStub();
      this.userRepository = new UserRepositoryStub();
      this.balanceRepository = new BalanceRepositoryStub();
    }

    if (this.mode === 'production' || this.mode === 'dev') {
      basePath = `${__dirname}/..`;
    }

    this.setupBasics();
    this.setupAuthentication();
    this.setupViewEngine(basePath);
    this.setupApplicationRouter();
    this.setupApiRouter();
    this.setupErrorHandling();
  }

  private setupBasics() {
    this.app.use(logger('dev'));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
  }

  private setupAuthentication() {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        async (email, password, done) => {
          const user = await this.userRepository.findByEmail(email);
          const credential = new UserCredential(email, password);

          if (credential.authenticate(user)) {
            done(null, user);
            return;
          }

          done(null, false, { message: 'Incorrect credentials.' });
        }
      )
    );

    passport.serializeUser((user: any, done) => {
      const currentUser = user as User;
      done(null, currentUser.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      const user = await this.userRepository.find(id);
      done(null, user);
    });

    const sessionOptions: any = {
      saveUninitialized: true,
      resave: true,
      secret: process.env.SESSION_SECRET || 'May the odds be ever in your favor.',
      name: 'session',
      httpOnly: true,
      cookie: {
        expires: 1000 * 3600 * 2, // 24 hours in miliseconds
      },
    };

    if (this.mode === 'production') {
      const SessionStore = MongoDBStore(session);
      const store = new SessionStore({
        uri: `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@dev.hw9tl.azure.mongodb.net/${process.env.DB}`,
        collection: 'clientSessions',
      });

      store.on('error', function (error) {
        console.log(error);
      });

      sessionOptions.store = store;
      //sessionOptions.secure = true; // TODO: use this option when https is available
    }

    this.app.use(session(sessionOptions));
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private setupViewEngine(basePath: string) {
    this.app.set('views', path.join(basePath, 'views'));
    this.app.set('view engine', 'pug');

    this.app.use(express.static(path.join(basePath, 'public')));
  }

  private setupApplicationRouter() {
    const homeController = new HomeController(this.userRepository);
    const budgetController = new BudgetController(this.budgetRepository, this.expenseRepository);
    const expenseController = new ExpenseController(this.budgetRepository, this.expenseRepository);
    const balanceController = new BalanceController(this.balanceRepository);

    const appRouter = new AppRouter(
      homeController,
      budgetController,
      expenseController,
      balanceController
    );

    this.app.use('/', appRouter.router);
  }

  private setupApiRouter() {
    const expenseController = new ApiExpenseController(this.expenseRepository);

    const apiRouter = new ApiRouter(expenseController);

    this.app.use('/api', apiRouter.router);
  }

  private setupErrorHandling() {
    // catch 404 and forward to error handler
    this.app.use((req: any, res: any, next: any) => {
      next(createError(404));
    });

    // error handler
    this.app.use((err: any, req: any, res: any) => {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  }
}

export default new Application();
