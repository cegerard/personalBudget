const session = require('supertest-session');

async function authenticate(app) {
  const appSession = session(app);
  await appSession.post('/login').send({
    email: 'admin@d2velop.fr',
    password: 'pass',
  });
  return appSession;
}

module.exports = { authenticate };
