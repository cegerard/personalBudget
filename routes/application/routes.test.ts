import StatusCodes from 'http-status-codes';
import request from 'supertest';

import application from '../../app';

const app = application.app;

describe('not found', () => {
  describe('GET /notFound', () => {
    it('should response with 404', async () => {
      await request(app).get('/notFound').expect(StatusCodes.NOT_FOUND);
    });
  });
});
