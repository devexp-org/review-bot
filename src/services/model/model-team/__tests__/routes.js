import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
import responseJSON from '../../../http/response';
import responseModel from '../../response';

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
    app.use(responseJSON());
    app.use(responseModel());
    app.use('/', router);
  });

  describe('/add', function () {

    it('should create a new team', function (done) {
      request(app)
        .post('/add')
        .field('name', 'testteam')
        .expect('{"data":{"name":"name","members":[],"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":2}}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if team already exsits', function (done) {
      const team = new TeamModel();

      team.save.returns(Promise.reject(new Error('Team "testteam" already exists')));

      request(app)
        .post('/add')
        .field('name', 'testteam')
        .expect('{"message":"Team \\"testteam\\" already exists"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('/get/:name', function () {

    it('should return a team', function (done) {
      request(app)
        .get('/get/testteam')
        .expect('{"data":{"name":"name","members":[],"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":2}}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if team is not found', function (done) {
      TeamModel.findByName
        .withArgs('foo')
        .returns(Promise.resolve(null));

      request(app)
        .get('/get/foo')
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

});
