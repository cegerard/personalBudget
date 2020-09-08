const superagent = require('superagent');


describe('Route', () => {
  describe('GET /', () => {
    it('should response with 200', async () => {
      const res = await superagent.get('http://localhost:21000/');
      expect(res.status).toEqual(200);
    });

    it('should render home page', async () => {
      const res = await superagent.get('http://localhost:21000/');
      expect(res.text).toMatchSnapshot();
    });
  });

  describe('GET /budgets', () => {
    it('should response with 200', async () => {
      const res = await superagent.get('http://localhost:21000/budgets');
      expect(res.status).toEqual(200);
    });

    it('should render budgets page', async () => {
      const res = await superagent.get('http://localhost:21000/budgets');
      expect(res.text).toMatchSnapshot();
    });
  });

  describe('GET /expenses', () => {
    it('should response with 200', async () => {
      const res = await superagent.get('http://localhost:21000/expenses');
      expect(res.status).toEqual(200);
    });

    it('should render expenses page', async () => {
      const res = await superagent.get('http://localhost:21000/expenses');
      expect(res.text).toMatchSnapshot();
    });
  });

  describe('GET /expenses/filter', () => {
    it('should response with 200', async () => {
      const res = await superagent.get('http://localhost:21000/expenses/filter?budgetName=Essence');
      expect(res.status).toEqual(200);
    });

    it('should render expenses filtered page', async () => {
      const res = await superagent.get('http://localhost:21000/expenses/filter?budgetName=Essence');
      expect(res.text).toMatchSnapshot();
    });
  });
});