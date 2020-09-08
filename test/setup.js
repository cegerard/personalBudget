const http = require('http');
const app = require('../app');

module.exports = async () => {
    const port = 21000;
    app.set('port', port);
    const testServer = http.createServer(app).listen(port);
    global.__TEST_SERVER__ = testServer;
}


