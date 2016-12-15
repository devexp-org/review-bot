import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
import handleError from '../../../http/middlewares/handle-error';

import modelMock from '../../../model/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { teamMock, teamModelMock } from '../__mocks__/';

describe('services/model/model-team/routes', function () {

  let app, options, imports, router;
  let model, logger, team, TeamModel;

  beforeEach(function () {
    app = express();

    team = teamMock();
    model = modelMock();
    logger = loggerMock();
    TeamModel = teamModelMock();

    options = {};
    imports = { logger, model };

    model
      .withArgs('team')
      .returns(TeamModel);

    TeamModel.findByName
      .withArgs('testteam')
      .returns(Promise.resolve(team));

    router = service(options, imports);
  });

  beforeEach(function () {
    app.use(bodyParser.json());
    app.use(handleError());
    app.use('/', router);
  });

  describe('GET /', function () {

    beforeEach(function () {
      TeamModel.exec.returns(Promise.resolve([team]));
    });

    it('should return a team list', function (done) {
      request(app)
        .get('/')
        .expect('[{"name":"name","members":[],"patterns":[],"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":2}}]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('POST /', function () {

    it('should create a new team', function (done) {
      request(app)
        .post('/')
        .field('name', 'testteam')
        .expect('{"name":"name","members":[],"patterns":[],"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":2}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if team already exsits', function (done) {
      const team = new TeamModel();

      team.save.returns(Promise.reject(new Error('Team "testteam" already exists')));

      request(app)
        .post('/')
        .field('name', 'testteam')
        .expect('{"message":"Team \\"testteam\\" already exists"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('GET /:id', function () {

    it('should return a team', function (done) {
      request(app)
        .get('/testteam')
        .expect('{"name":"name","members":[],"patterns":[],"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":2}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if team is not found', function (done) {
      TeamModel.findByName
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .get('/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('PUT /:id', function () {

    it('should update a team', function (done) {
      request(app)
        .put('/testteam')
        .send({ name: 'testteam', reviewConfig: { approveCount: 5, totalReviewers: 10 } })
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert(team.save.calledAfter(team.set));
          assert.calledWith(team.set, 'name', 'testteam');
          assert.calledWith(team.set, 'reviewConfig', {
            approveCount: 5,
            totalReviewers: 10
          });
          done();
        });
    });

    it('should return an error if a team is not found', function (done) {
      TeamModel.findByName
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .put('/foo')
        .send({ name: 'testteam', reviewConfig: {} })
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('DELETE /:id', function () {

    it('should delete a team', function (done) {
      request(app)
        .delete('/testteam')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert.called(team.remove);
          done();
        });
    });

    it('should return an error if a team is not found', function (done) {
      TeamModel.findByName
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .delete('/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

});
