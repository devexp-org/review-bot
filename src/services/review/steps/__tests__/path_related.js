import _ from 'lodash';
import service, {
  isMatchAny, isMatchAll, getFiles, incRank, decRank
} from '../path_related';

import { pullRequestMock } from '../../../model/pull-request/__mocks__/';
import { reviewMembersMock } from '../../__mocks__/';
import { membersMock } from '../../../team-dispatcher/__mocks__/';


describe('services/review/steps/path_related', function () {

  describe('#isMatch', function () {

    it('should return true if pattern match files pathes', function () {
      assert.isTrue(isMatchAny(['test.js', 'test.priv.js'], ['*.js']));
    });

    it('should return false if pattern doesn`t match files pathes', function () {
      assert.isFalse(isMatchAny(['test.js', 'test.priv.js'], ['*.css']));
    });

  });

  describe('#isMatchAll', function () {

    it('should return true if all patterns match files pathes', function () {
      assert.isTrue(isMatchAll(['test.js', 'test.priv.js'], ['*.js', 'test.*']));
    });

    it('should return false if not all patterns match files pathes', function () {
      assert.isFalse(isMatchAll(['test.js', 'test.priv.js'], ['*.js', '*.css']));
    });

  });

  describe('#getFiles', function () {

    it('should return promise resolved into files', function (done) {
      const files = [{ filename: '' }, { filename: '' }, { filename: '' }];

      const pullRequest = pullRequestMock();
      pullRequest.files = files;

      getFiles(pullRequest)
        .then(result => assert.deepEqual(result, ['', '', '']))
        .then(done, done);
    });

    it('should return rejected promise if there are no any files', function (done) {
      const pullRequest = pullRequestMock();

      pullRequest.files = [];

      getFiles(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /no files/i))
        .then(done, done);
    });
  });

  describe('incRank', function () {

    let team, members, options;

    beforeEach(function () {
      team = reviewMembersMock();
      members = ['Hulk', 'Hawkeye'];
      options = { pattern: ['*.js'], max: 5, members };
    });

    it('should increment rank for one random member of team', function (done) {
      const step = incRank(options, { members: team });

      step(['test.js'])
        .then(reviewers => {
          _.forEach(reviewers, (member) => {
            assert.isAtLeast(member.rank, 0);
          });

          assert.isAbove(reviewers.length, 0);
        })
        .then(done, done);
    });

    it('should not change rank if there are no matched pathes', function (done) {
      const step = incRank(options, { members: team });

      step(['test.css'])
        .then(reviewers => assert.deepEqual(reviewers, []))
        .then(done, done);
    });
  });

  describe('decRank', function () {

    let team, members, options;

    beforeEach(function () {
      team = reviewMembersMock();
      members = ['Hulk', 'Hawkeye'];
      options = { pattern: ['*.js'], max: 5, members };
    });

    it('should decrement rank for all members specified in options', function (done) {
      const step = decRank(options, { members: team });

      step(['test.js'])
        .then(reviewers => {
          _.forEach(reviewers, (member) => {
            assert.isAtMost(member.rank, 0);
          });

          assert.isAbove(reviewers.length, 0);
        })
        .then(done, done);
    });

    it('should not change rank if there is no matched pathes', function (done) {
      const step = decRank(options, { members: team });

      step(['test.css'])
        .then(reviewers => assert.deepEqual(reviewers, []))
        .then(done, done);
    });
  });

  describe('service', function () {
    let step, team, pullRequest, options;

    beforeEach(() => {
      step = service();

      team = reviewMembersMock();

      pullRequest = pullRequestMock();

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
      pullRequest.review.reviewers = membersMock();

      step(review, options)
        .then(members => {
          const reviewer = _.find(members, { login: 'Hulk' });
          assert.isAbove(reviewer.rank, 0);
          assert.isBelow(reviewer.rank, 6);
        })
        .then(done, done);
    });

    it('should dec rank if all patterns match', function (done) {
      const review = { members: team, pullRequest };

      pullRequest.files = [{ filename: 'a.json' }];
      pullRequest.review.reviewers = membersMock();

      step(review, options)
        .then(members => {
          const reviewer = _.find(members, { login: 'Hulk' });
          assert.isAbove(reviewer.rank, -6);
          assert.isBelow(reviewer.rank, 0);
        })
        .then(done, done);
    });

  });

});
