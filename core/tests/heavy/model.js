'use strict';

import _ from 'lodash';
import path from 'path';

import Application from '../../modules/application';
import projectConfig from '../../modules/config';

import { withPullRequest } from './common';

describe('model', function () {

  const basePath = path.resolve('.');
  const appConfig = projectConfig(basePath, 'testing');
  appConfig.services.logger.options.transports = [];

  let _appConfig, application;
  beforeEach(function () {
    _appConfig = _.clone(appConfig, true);
    application = new Application(_appConfig, basePath);
  });

  const pullRequestHook = require('../data/pull_request_webhook');
  pullRequestHook.pull_request.repository = pullRequestHook.repository;
  pullRequestHook.pull_request.organization = pullRequestHook.organization;

  const withApp = function (test, done) {
    application
      .execute()
      .then(test)
      .then(::application.shutdown)
      .then(done)
      .catch(done);
  };

  let PullRequest;
  const withModel = function (test, done) {
    withApp(imports => {
      const model = imports.model;
      PullRequest = model.get('pull_request');
      const pullRequest = new PullRequest();

      return PullRequest.remove({}).then(() => pullRequest).then(test);
    }, done);
  };

  describe('modules/model/pull_request', function () {

    it('should setup model', function (done) {

      withPullRequest(imports => {
        const pullRequest = imports.pullRequest;
        assert.equal(pullRequest.id, pullRequest._id);
      }, done);

    });

    it('should apply pre-save hooks and extenderes', function (done) {

      withPullRequest(imports => {
        const pullRequest = imports.pullRequest;
        assert.isNumber(pullRequest.complexity);
      }, done);

    });

    describe('#findByUser', function () {

      it('should return pull requests filtered by user', function (done) {

        withPullRequest(imports => {
          PullRequest = imports.PullRequest;

          PullRequest.findByUser('d4rkr00t')
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
            });
        }, done);

      });

      it('should return an empty array if pulls not found', function (done) {

        withModel(pullRequest => {
          return PullRequest
            .findByUser('d4rkr00t')
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 0);
            });
        }, done);

      });

    });

    describe('#findByReviewer', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withModel(pullRequest => {
          pullRequest.set(pullRequestHook.pull_request);
          pullRequest.set('review', {
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save().then(() => {
            return PullRequest
              .findByReviewer('sbmaxx')
              .then(result => {
                assert.isArray(result);
                assert.lengthOf(result, 1);
              });
          });
        }, done);

      });

    });

    describe('#findByNumberAndRepository', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withModel(pullRequest => {
          pullRequest.set(pullRequestHook.pull_request);

          return pullRequest.save().then(() => {
            return PullRequest
              .findByNumberAndRepository(49, 'devexp-org/devexp')
              .then(result => {
                assert.equal(result.id, pullRequest.id);
              });
          });
        }, done);

      });

    });

    describe('#findOpenReviewsByUser', function () {

      it('should return open pull requests filtered by reviewer', function (done) {

        withModel(pullRequest => {
          pullRequest.set(pullRequestHook.pull_request);
          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save().then(() => {
            return PullRequest
              .findOpenReviewsByUser('sbmaxx')
              .then(result => {
                assert.isArray(result);
                assert.lengthOf(result, 1);
              });
          });
        }, done);

      });

    });

  });

});
