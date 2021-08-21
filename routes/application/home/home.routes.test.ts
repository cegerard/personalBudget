import StatusCodes from 'http-status-codes';
import request from 'supertest';

import application from '../../../app';

const app = application.app;

describe('Home', () => {
  describe('GET /', () => {
    it('should response with 302', async () => {
      await request(app).get('/').expect(StatusCodes.MOVED_TEMPORARILY);
    });

    it('should render home page', async () => {
      await request(app)
        .get('/')
        .then((res) => {
          expect(res.text).toMatchSnapshot();
        });
    });
  });
});
