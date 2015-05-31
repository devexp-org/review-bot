var request = require('supertest'),
    json = require('../../payloads/pull.opened.json'),
    app = require('../../app.js');

describe('POST /api/github/webhook', function () {
    it('respond ok', function (done) {
        request(app)
            .post('/api/github/webhook')
            .send(json)
            .expect(200, done);
    });
});
