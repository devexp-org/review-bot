import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import proxyquire from 'proxyquire';

// import service from '../routes';
import responseJSON from '../../http/response';
import loggerMock from '../../logger/__mocks__/index';

describe('services/pull-request-github/routes', function () {

  let app, router, service;
  let options, imports, logger;
  let pullRequestHookStub, issueCommentHookStub;

  beforeEach(function () {
    app = express();

    logger = loggerMock();

    options = {};
    imports = { logger };

    pullRequestHookStub = sinon.stub().returns(Promise.resolve({}));

    issueCommentHookStub = sinon.stub().returns(Promise.resolve({}));

    const routes = proxyquire('../routes', {
      './webhooks/pull_request': {
        'default': pullRequestHookStub
      },
      './webhooks/issue_comment': {
        'default': issueCommentHookStub
      }
    });

    service = routes.default;

    router = service(options, imports);
  });

  it('should response `ok` on `/i`', function (done) {
    app.use(router);

    request(app)
      .get('/i')
      .expect('Content-Type', /text\/html/)
      .expect(200)
      .expect('ok')
      .end(done);
  });

  describe('`/webhook` without bodyParser', function () {

    it('should fail if body-parser is not installed', function (done) {
      app.use(responseJSON());
      app.use(router);

      request(app)
        .post('/webhook')
        .type('json')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('`/webhook` with header `x-github-event`', function () {

    beforeEach(function () {
      app.use(responseJSON());
      app.use(bodyParser.json());

      app.use(router);
    });

    it('should response `pong` on `ping`', function (done) {
      request(app)
        .post('/webhook')
        .type('json')
        .send('{"action": "ping"}')
        .set('x-github-event', 'ping')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect('pong')
        .end(done);
    });

    it('should call pullRequestHook on `pull_request`', function (done) {
      request(app)
        .post('/webhook')
        .type('json')
        .send('{"action": "pull_request"}')
        .set('x-github-event', 'pull_request')
        .expect(200)
        .end(function () {
          assert.called(pullRequestHookStub);
          done();
        });
    });

    it('should call issueCommentHook on `issue_comment`', function (done) {
      request(app)
        .post('/webhook')
        .type('json')
        .send('{"action": "issue_comment"}')
        .set('x-github-event', 'issue_comment')
        .expect(200)
        .end(function () {
          assert.called(issueCommentHookStub);
          done();
        });
    });

    it('should fail on unknown event', function (done) {
      request(app)
        .post('/webhook')
        .type('json')
        .send('{"action": "foo"}')
        .set('x-github-event', 'foo')
        .expect(500)
        .expect(/unknown event/i)
        .end(done);
    });
  });

});
