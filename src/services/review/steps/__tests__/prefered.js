import _ from 'lodash';
import service, { findReviewersInDescription } from
  '../prefered';
import teamManagerMock, { teamDriverMock } from
  '../../../team-manager/__mocks__/';
import { membersMock } from '../../../command/__mocks__/';
import { reviewMembersMock } from '../../../review/__mocks__/';
import { pullRequestMock } from
  '../../../model/model-pull-request/__mocks__/';
import { pullRequestReviewMixin } from
  '../../../pull-request-review/__mocks__/';

describe('services/review/steps/prefered', function () {

  describe('#findReviewersInDescription', function () {

    it('should parse and return logins from description', function () {
      const body = '@abc, check this out.';

      const logins = findReviewersInDescription(body);

      assert.deepEqual(logins, ['abc']);
    });

    it('should parse many logins', function () {
      const body = '@foo, check this out. And @bar too, plz';

      const logins = findReviewersInDescription(body);

      assert.deepEqual(logins, ['foo', 'bar']);
    });

  });

  describe('service', function () {
    let step, team, pullRequest, options, teamManager, teamDriver;

    beforeEach(() => {
      options = { max: 10 };

      teamDriver = teamDriverMock();

      teamManager = teamManagerMock(teamDriver);

      step = service({}, { 'team-manager': teamManager });

      team = reviewMembersMock();

      pullRequest = pullRequestMock(pullRequestReviewMixin);
    });

    it('should inc rank if reviewer mentioned in description', function (done) {
      const review = { members: membersMock(), pullRequest };

      pullRequest.body = '@Hulk';

      step(review, options)
        .then(members => {
          const reviewer = _.find(members, { login: 'Hulk' });
          assert.equal(reviewer.rank, 500);
        })
        .then(done, done);
    });

    it('should search mentioned users in team', function (done) {
      const review = { members: team, pullRequest };

      teamManager.findTeamByPullRequest().then(teamStub => {

        teamStub.findTeamMember
          .withArgs(pullRequest, 'Foo')
          .returns(Promise.resolve({ login: 'Foo' }));

        pullRequest.body = '@Foo and @Bar';
        pullRequest.review.members = [];

        step(review, options)
          .then(members => {
            const reviewerA = _.find(members, { login: 'Foo' });
            const reviewerB = _.find(members, { login: 'Bar' });

            assert.equal(reviewerA.rank, 500);

            assert.isUndefined(reviewerB);
          })
          .then(done, done);
      })
      .catch(done);
    });

  });

});
