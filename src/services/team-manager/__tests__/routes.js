import express from 'express';
import request from 'supertest';
import service from '../routes';
import responseJSON from '../../http/response';

import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../__mocks__/';

describe('services/team-manager/routes', function () {

  let app, options, imports, router;
  let logger, teamManager, drivers;

  beforeEach(function () {
    app = express();

    logger = loggerMock();
    teamManager = teamManagerMock();

    options = {};
    imports = { logger, 'team-manager': teamManager };

    drivers = [
      { name: () => 'static', config: () => { return {}; } },
      { name: () => 'github', config: () => { return { orgName: { type: 'string' } }; } }
    ];

    teamManager.getDrivers.returns(drivers);

    router = service(options, imports);

    app.use(responseJSON());
    app.use('/', router);

  });

  describe('GET /drivers', function () {

    it('should return all drivers', function (done) {
      request(app)
        .get('/drivers')
        .expect('{"static":{},"github":{"orgName":{"type":"string"}}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

});
