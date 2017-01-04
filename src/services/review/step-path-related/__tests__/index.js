import _ from 'lodash';
import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from '../../../pull-request-review/__mocks__/';

describe('services/review/steps/path-related', function () {

  let step;

  beforeEach(function () {
    step = service();
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  describe('#isMatch', function () {

    it('should return true if pattern match files pathes', function () {
      assert.isTrue(step.isMatchAny(['test.js', 'test.priv.js'], ['*.js']));
    });

    it('should return false if pattern doesn`t match files pathes', function () {
      assert.isFalse(step.isMatchAny(['test.js', 'test.priv.js'], ['*.css']));
    });

  });

  describe('#isMatchAll', function () {

    it('should return true if all patterns match files pathes', function () {
      assert.isTrue(step.isMatchAll(['test.js', 'test.priv.js'], ['*.js', 'test.*']));
    });

    it('should return false if not all patterns match files pathes', function () {
      assert.isFalse(step.isMatchAll(['test.js', 'test.priv.js'], ['*.js', '*.css']));
    });

  });

  describe('#getFiles', function () {

    it('should return promise resolved into files', function (done) {
      const files = [{ filename: '' }, { filename: '' }, { filename: '' }];

      const pullRequest = pullRequestMock(pullRequestReviewMixin);
      pullRequest.files = files;

      step.getFiles(pullRequest)
        .then(result => assert.deepEqual(result, ['', '', '']))
        .then(done, done);
    });

    it('should return rejected promise if there are no any files', function (done) {
      const pullRequest = pullRequestMock(pullRequestReviewMixin);

      pullRequest.files = [];

      step.getFiles(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /no files/i))
        .then(done, done);
    });
  });

  describe('incRank', function () {

    let team, members, options;

    beforeEach(function () {
      team = reviewMock();
      members = ['Hulk', 'Hawkeye'];
      options = { pattern: ['*.js'], max: 5, members };
    });

    it('should increment rank for one random member of team', function (done) {
      const inc = step.incRank({ members: team }, options);

      inc(['test.js'])
        .then(review => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          const hawkeye = _.find(review.members, { login: 'Hawkeye' });
          assert(hulk.rank > 8 || hawkeye.rank > 3);
        })
        .then(done, done);
    });

    it('should not change rank if there are no matched pathes', function (done) {
      const inc = step.incRank({ members: team }, options);

      inc(['test.css'])
        .then(review => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          const hawkeye = _.find(review.members, { login: 'Hawkeye' });
          assert(hulk.rank === 8 && hawkeye.rank === 3);
        })
        .then(done, done);
    });
  });

  describe('decRank', function () {

    let team, members, options;

    beforeEach(function () {
      team = reviewMock();
      members = ['Hulk', 'Hawkeye'];
      options = { pattern: ['*.js'], max: 5, members };
    });

    it('should decrement rank for all members specified in options', function (done) {
      const dec = step.decRank({ members: team }, options);

      dec(['test.js'])
        .then(review => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          const hawkeye = _.find(review.members, { login: 'Hawkeye' });
          assert(hulk.rank < 8 || hawkeye.rank < 3);
        })
        .then(done, done);
    });

    it('should not change rank if there is no matched pathes', function (done) {
      const dec = step.decRank({ members: team }, options);

      dec(['test.css'])
        .then(review => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          const hawkeye = _.find(review.members, { login: 'Hawkeye' });
          assert(hulk.rank === 8 && hawkeye.rank === 3);
        })
        .then(done, done);
    });
  });

  describe('service', function () {
    let team, pullRequest, options;

    beforeEach(() => {
      team = reviewMock();

      pullRequest = pullRequestMock(pullRequestReviewMixin);

      options = {
        max: 5,
        members: ['Hulk'],
        incPattern: ['*.js'],
        decPattern: ['*.json']
      };

    });

    it('should inc rank if any pattern match', function (done) {
      const review = { members: team, pullRequest };

      pullRequest.files = [{ filename: 'a.js' }];
      pullRequest.review.reviewers = reviewMock();

      step.process(review, options)
        .then(review => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          assert.isAbove(hulk.rank, 8);
        })
        .then(done, done);
    });

    it('should dec rank if all patterns match', function (done) {
      const review = { members: team, pullRequest };

      pullRequest.files = [{ filename: 'a.json' }];
      pullRequest.review.reviewers = reviewMock();

      step.process(review, options)
        .then(reveiw => {
          const hulk = _.find(review.members, { login: 'Hulk' });
          assert.isBelow(hulk.rank, 8);
        })
        .then(done, done);
    });

  });

});
