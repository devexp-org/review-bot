import request from 'supertest';
import service from '../../http';
import loggerMock from '../../logger/__mocks__/index';

describe('services/http (integration)', function () {

  let options, imports;

  beforeEach(function () {

    options = {
      routes: {
        '/favicon.ico': 'favicon',
        '/public': 'static',
        '/': 'index'
      }
    };

    imports = {
      index: require('../routes/index').default({ assets: './assets' }, {}),
      'static': require('../routes/static').default({ assets: './public' }, {}),
      favicon: require('../routes/favicon').default({ assets: './assets' }, {}),
      logger: loggerMock()
    };

  });

  it('should serve index.html', function (done) {

    service(options, imports, (app) => {
      request(app)
        .get('/')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .end(err => {
          app.shutdown(() => done(err));
        });
    });

  });

  it('should serve favicon.ico', function (done) {

    service(options, imports, (app) => {
      request(app)
        .get('/favicon.ico')
        .expect('Content-Type', /^image\/x-icon$/)
        .expect(200)
        .end(err => {
          app.shutdown(() => done(err));
        });
    });

  });

  it('should serve static from /public', function (done) {

    service(options, imports, (app) => {
      request(app)
        .get('/public/1.txt')
        .expect('1.txt\n')
        .end(err => {
          app.shutdown(() => done(err));
        });
    });

  });

  it('should return 404 if file not found in /public', function (done) {

    service(options, imports, (app) => {
      request(app)
        .get('/public/file-not-exists')
        .expect(404)
        .end(err => {
          app.shutdown(() => done(err));
        });
    });

  });

});
