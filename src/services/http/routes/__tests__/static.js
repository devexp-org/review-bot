import path from 'path';
import express from 'express';
import request from 'supertest';
import service from '../static';

describe('services/http/routes/static', function () {

  let app, router;
  let options, imports;

  beforeEach(function () {
    app = express();

    options = {
      assets: path.resolve(__dirname, '../../__tests__/assets')
    };

    imports = {};

    router = service(options, imports);
  });

  it('should return content of file if the file exists', function (done) {
    app.use(router);

    request(app)
      .get('/1.txt')
      .expect('Content-Type', /text\/plain/)
      .expect(200)
      .expect('1.txt\n')
      .end(done);
  });

  it('should return 404 status if the file does not exist', function (done) {
    app.use(router);

    request(app)
      .get('/2.txt')
      .expect('Content-Type', /text\/plain/)
      .expect(404)
      .end(done);
  });

  it('should throw an error if assets path is not given', function () {
    options = {};
    assert.throws(() => service(options, imports), /assets/);
  });

});
