var request = require('supertest'),
    json = require('../../payloads/pull.opened.json'),
    app = require('../../app.js');

describe('GET /api/team', function () {
    it('respond ok', function (done) {
        request(app)
            .get('/api/team')
            .expect(200)
            .expect([{"name":"foo bar","login":"foo","email":"foo@gmail.com"}], done);
    });
});
