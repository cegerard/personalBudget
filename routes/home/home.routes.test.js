const http = require('http-status-codes').StatusCodes;
const request = require('supertest');

const app = require('../../app').app;

describe('Home', () => {
  describe('GET /', () => {
    it('should response with 302', async () => {
      await request(app).get('/').expect(http.MOVED_TEMPORARILY);
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
