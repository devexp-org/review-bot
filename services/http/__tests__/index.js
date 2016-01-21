import request from 'supertest';
import service from '../../http';
import loggerMock from '../../logger/__mocks__/index';

describe('services/http', function () {

  let options, imports;

  beforeEach(function () {

    options = {};

    imports = {
      logger: loggerMock()
    };

  });

  it('should setup http-server', function (done) {

    imports.index = function (req, res) {
      res.status(200).send('ok').end();
    };

    options.routes = { '/': 'index' };

    service(options, imports, (app) => {
      request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .end(err => {
          err ? done(err) : app.shutdown(done);
        });
    });

  });

});
