import express from 'express';
import request from 'supertest';
import service from '../routes';
import bodyParser from 'body-parser';
import handleError from '../../../http/middlewares/handle-error';

import modelMock from '../../../model/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { teamMock, teamModelMock } from '../__mocks__/';
import { userMock, userModelMock } from '../../model-user/__mocks__/';

describe('services/model/model-team/routes', function () {

  let app, options, imports, router;
  let model, logger, team, user, TeamModel, UserModel;

  beforeEach(function () {
    app = express();

    team = teamMock();
    user = userMock();
    model = modelMock();
    logger = loggerMock();
    TeamModel = teamModelMock();
    UserModel = userModelMock();

    options = {};
    imports = { logger, model };

    model
      .withArgs('team')
      .returns(TeamModel);

    model
      .withArgs('user')
      .returns(UserModel);

    TeamModel.findByName
      .withArgs('test-team')
      .returns(Promise.resolve(team));

    TeamModel.findByNameWithMembers
      .withArgs('test-team')
      .returns(Promise.resolve(team));

    UserModel.findByLogin
      .withArgs('testuser')
      .returns(Promise.resolve(user));

    router = service(options, imports);

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
        .expect('[{"name":"name","members":[],"patterns":[],"driver":{"name":"static","options":{}},"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":3}}]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('POST /', function () {

    it('should create a new team', function (done) {
      request(app)
        .post('/')
        .send({ name: 'test-team' })
        .expect('{"name":"name","members":[],"patterns":[],"driver":{"name":"static","options":{}},"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":3}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it('should return an error if team already exsits', function (done) {
      const team = new TeamModel();

      team.save.returns(Promise.reject(new Error('Team "test-team" already exists')));

      request(app)
        .post('/')
        .send({ 'name': 'test-team' })
        .expect('{"message":"Team \\"test-team\\" already exists"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

  describe('GET /:id', function () {

    it('should return a team', function (done) {
      request(app)
        .get('/test-team')
        .expect('{"name":"name","members":[],"patterns":[],"driver":{"name":"static","options":{}},"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":3}}')
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
        .put('/test-team')
        .send({ name: 'test-team', reviewConfig: { approveCount: 5, totalReviewers: 10 } })
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(() => {
          assert(team.save.calledAfter(team.set));
          assert.calledWith(team.set, 'name', 'test-team');
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
        .send({ name: 'test-team', reviewConfig: {} })
        .expect(/not found/)
        .expect('Content-Type', /application\/json/)
        .expect(404)
        .end(done);
    });

  });

  describe('DELETE /:id', function () {

    it('should delete a team', function (done) {
      request(app)
        .delete('/test-team')
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

  describe('GET /:id/members', function () {

    beforeEach(function () {
      team.members = [{ login: 'foo' }, { login: 'bar' }];
    });

    it('should return a member list', function (done) {
      request(app)
        .get('/test-team/members')
        .expect('[{"login":"foo"},{"login":"bar"}]')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

  });

  describe('POST /:id/members', function () {

    it('should add a user to a team', function (done) {
      request(app)
        .post('/test-team/members')
        .send({ login: 'testuser' })
        .expect('{"name":"name","members":[{"login":"testuser","contacts":[]}],"patterns":[],"driver":{"name":"static","options":{}},"reviewConfig":{"steps":[{"name":"load","options":{"max":5}}],"approveCount":2,"totalReviewers":3}}')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(done);
    });

    it.skip('should return an error if user is already a member', function (done) {
      const team = new TeamModel();

      // team.save.returns(Promise.reject(new Error('Team "test-team" is already exists')));

      request(app)
        .post('/test-team/members')
        .send( { login: 'testuser' })
        .expect('{"message":"User \\"testuser\\" is already member"}')
        .expect('Content-Type', /application\/json/)
        .expect(500)
        .end(done);
    });

  });

});
