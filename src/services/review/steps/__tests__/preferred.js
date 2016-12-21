import _ from 'lodash';
import service from '../preferred';

import { reviewMock } from '../../__mocks__/';
import teamManagerMock, { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/review/steps/preferred', function () {

  let step, members, imports, pullRequest, options, teamManager, teamDriver;

  beforeEach(function () {
    options = { max: 10 };

    members = reviewMock();

    teamDriver = teamDriverMock();

    teamManager = teamManagerMock(teamDriver);

    pullRequest = pullRequestMock(pullRequestReviewMixin);

    imports = { 'team-manager': teamManager };

    step = service({}, imports);
  });

  describe('#name', function () {

    it('should return `preferred`', function () {
      assert.equal(step.name(), 'preferred');
    });

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  describe('#findReviewersInDescription', function () {

    it('should parse and return logins from description', function () {
      const body = '@abc, check this out.';
      const logins = step.findReviewersInDescription(body);

      assert.deepEqual(logins, ['abc']);
    });

    it('should parse many logins', function () {
      const body = '@foo, check this out. And @bar too, plz';
      const logins = step.findReviewersInDescription(body);

      assert.deepEqual(logins, ['foo', 'bar']);
    });

  });

  it('should inc rank if reviewer mentioned in description', function (done) {
    const review = { members, pullRequest };

    pullRequest.body = '@Hulk';

    step.process(review, options)
      .then(actual => {
        const reviewer = _.find(actual.members, { login: 'Hulk' });
        assert.equal(reviewer.rank, 508);
      })
      .then(done, done);
  });

  it('should search mentioned users in team', function (done) {
    const review = { members, pullRequest };

    teamDriver.findTeamMember
      .withArgs('foo')
      .returns(Promise.resolve({ login: 'foo' }));

    pullRequest.body = '@foo and @bar';
    pullRequest.review.members = [];

    step.process(review, options)
      .then(actual => {
        const reviewerA = _.find(actual.members, { login: 'foo' });
        const reviewerB = _.find(actual.members, { login: 'bar' });

        assert.equal(reviewerA.rank, 500);
        assert.isUndefined(reviewerB);
      })
      .then(done, done);
  });

  it('should return rejected promise if there is no team', function (done) {
    const review = { members, pullRequest };

    teamManager
      .findTeamByPullRequest
      .returns(Promise.resolve(null));

    pullRequest.body = '@foo and @bar';
    pullRequest.review.members = [];

    step.process(review, options)
      .then(() => assert.fail())
      .catch(e => assert.match(e.message, /not found/))
      .then(done, done);
  });

});
