import _ from 'lodash';
import service, { findReviewersInDescription } from '../prefered-reviewers';

import { pullRequestMock } from
  '../../../../services/model/collections/__mocks__/pull-request';
import teamDispatcherMock from
  '../../../../services/team-dispatcher/__mocks__/index';

import { reviewMembersMock } from
  '../../../../services/review/__mocks__/index';
import { members as membersMock } from
  '../../../../services/team-dispatcher/__mocks__/index';

describe('plugins/review/steps/prefered-reviewers', function () {

  describe('#findReviewersInDescription', function () {

    it('should parse and return logins from description', function () {
      const body = '@abc, check this out.';

      const logins = findReviewersInDescription(body);

      assert.deepEqual(logins, ['abc']);
    });

    it('should parse many logins', function () {
      const body = '@foo, check this out. And @bar too plz';

      const logins = findReviewersInDescription(body);

      assert.deepEqual(logins, ['foo', 'bar']);
    });

  });

  describe('service', function () {
    let step, team, pullRequest, options, teamDispatcher;

    beforeEach(() => {
      options = { max: 10 };

      teamDispatcher = teamDispatcherMock();

      step = service({}, { 'team-dispatcher': teamDispatcher });

      team = reviewMembersMock();

      pullRequest = pullRequestMock();
    });

    it('should inc rank if reviewer mentioned in description', function (done) {
      const review = { members: team, pullRequest };

      pullRequest.body = '@Hulk';
      pullRequest.review.reviewers = membersMock();

      step(review, options)
        .then(members => {
          const reviewer = _.find(members, { login: 'Hulk' });
          assert.equal(reviewer.rank, 500);
        })
        .then(done, done);
    });

    it('should search mentioned users in team', function (done) {
      const review = { members: team, pullRequest };

      const teamStub = teamDispatcher.findTeamByPullRequest();

      teamStub.findTeamMember
        .withArgs(pullRequest, 'Foo')
        .returns(Promise.resolve({ login: 'Foo' }));

      pullRequest.body = '@Foo and @Bar';
      pullRequest.review.reviewers = membersMock();

      step(review, options)
        .then(members => {
          const reviewerA = _.find(members, { login: 'Foo' });
          const reviewerB = _.find(members, { login: 'Bar' });

          assert.equal(reviewerA.rank, 500);

          assert.isUndefined(reviewerB);
        })
        .then(done, done);
    });

  });

});
