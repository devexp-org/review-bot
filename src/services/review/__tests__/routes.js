import express from 'express';
import request from 'supertest';
import service from '../routes';
import handleError from '../../http/middlewares/handle-error';

import loggerMock from '../../logger/__mocks__/';
import reviewMock from '../__mocks__/';

describe('services/review/routes', function () {

  let app, options, imports, router;
  let logger, review, steps;

  beforeEach(function () {
    app = express();

    logger = loggerMock();
    review = reviewMock();

    options = {};
    imports = { logger, review };

    steps = {
      total: { config: () => { return {}; } },
      commiters: { config: () => { return { days: { type: 'number' } }; } }
    };

    review.getSteps.returns(steps);

    router = service(options, imports);

    app.use(handleError());
    app.use('/', router);

  });

  describe('GET /steps', function () {

    it('should return all steps', function (done) {
      request(app)
        .get('/steps')
        .expect('{"total":{},"commiters":{"days":{"type":"number"}}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

});
