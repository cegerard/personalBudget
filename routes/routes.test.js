const http = require('http-status-codes').StatusCodes;
const request = require('supertest');

const app = require('../app').app;

describe('not found', () => {
  describe('GET /notFound', () => {
    it('should response with 404', async () => {
      await request(app).get('/notFound').expect(http.NOT_FOUND);
    });
  });
});
