import StatusCodes from 'http-status-codes';
import request, { Response } from 'supertest';

import application from '../../../app';
import { authenticate } from '../../../test/authHelper';
import UserRepositoryStub from '../../../test/stubs/UserRepositoryStub';

const userRepository = application.userRepository as UserRepositoryStub;
let app: any;

describe('Home', () => {
  beforeEach(() => {
    userRepository.resetStore();
    app = application.app;
  });

  describe('GET /', () => {
    describe('without authentication', () => {
      it('should response with 200', async () => {
        await request(app).get('/').expect(StatusCodes.OK);
      });

      it('should render home page', async () => {
        await request(app)
          .get('/')
          .then((res) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('with authentication', () => {
      beforeEach(async () => {
        app = await authenticate(application.app);
      });

      it('should response with 200', async () => {
        await app.get('/').expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render budgets page', async () => {
        await app.get('/').then((res: any) => {
          expect(res.text).toMatchSnapshot();
        });
      });
    });
  });

  describe('POST /login', () => {
    describe('when the user does not exists', () => {
      it('should response with 302', async () => {
        await request(app)
          .post('/login')
          .set('Content-Type', 'application/json')
          .send({ email: 'd2v@lop.fr', password: '123' })
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render login page', async () => {
        await request(app)
          .post('/login')
          .set('Content-Type', 'application/json')
          .send({ email: 'd2v@lop.fr', password: '123' })
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when the user exists', () => {
      const userEmail = 'admin@d2velop.fr';
      const userPassword = 'pass';


      describe('when the credentials are not valid', () => {
        it('should response with 302', async () => {
          await request(app)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ email: userEmail, password: 'not_valid' })
            .expect(StatusCodes.MOVED_TEMPORARILY);
        });

        it('should render login page', async () => {
          await request(app)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ email: userEmail, password: 'not_valid' })
            .then((res: Response) => {
              expect(res.text).toMatchSnapshot();
            });
        });
      });

      describe('when the credentials are valid', () => {
        it('should response with 302', async () => {
          await request(app)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ email: userEmail, password: userPassword })
            .expect(StatusCodes.MOVED_TEMPORARILY);
        });

        it('should render the budget list page', async () => {
          await request(app)
            .post('/login')
            .set('Content-Type', 'application/json')
            .send({ email: userEmail, password: userPassword })
            .then((res: Response) => {
              expect(res.text).toMatchSnapshot();
            });
        });
      });
    });
  });

  describe('GET /sign_up', () => {
    it('should response with 200', async () => {
      await request(app).get('/').expect(StatusCodes.OK);
    });

    it('should render sign up page', async () => {
      await request(app)
        .get('/sign_up')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });

  describe('POST /sign_up', () => {
    let newUser: any;

    beforeEach(() => {
      newUser = {
        firstName: 'to',
        lastName: 'to',
        email: 'toto@gmail.com',
        password: '1234567',
        password2: '1234567',
      };
    });

    describe('when the sign up is successful', () => {
      it('should response with 302', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render budgets list page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when passwords does not match', () => {
      beforeEach(() => {
        newUser.password2 = 'do not match';
      });

      it('should response with 400', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render sign up page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when password is empty', () => {
      beforeEach(() => {
        newUser.password = '';
        newUser.password2 = '';
      });

      it('should response with 400', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render sign up page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when password is undefined', () => {
      beforeEach(() => {
        newUser.password = undefined;
        newUser.password2 = undefined;
      });

      it('should response with 400', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render sign up page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when password is null', () => {
      beforeEach(() => {
        newUser.password = null;
        newUser.password2 = null;
      });

      it('should response with 400', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render sign up page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });

    describe('when user already exists', () => {
      beforeEach(async () => {
        await userRepository.create(newUser);
      });

      it('should response with 409', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .expect(StatusCodes.MOVED_TEMPORARILY);
      });

      it('should render sign up page', async () => {
        await request(app)
          .post('/sign_up')
          .set('Content-Type', 'application/json')
          .send(newUser)
          .then((res: Response) => {
            expect(res.text).toMatchSnapshot();
          });
      });
    });
  });
});
