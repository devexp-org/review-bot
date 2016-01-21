import { clone } from 'lodash';

import service from '../busy';
import teamMock from '../../choose-team/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import { mockReviewers } from '../__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull_request';


describe('services/command/busy', () => {

  describe('#command', () => {
    let command;
    let action, events, logger, team, review;
    let options, imports, comment, payload, pullRequest, reviewResult;

    const promise = (x) => Promise.resolve(x);

    beforeEach(() => {

      team = teamMock();
      team.findTeamMemberByPullRequest.returns(promise({ login: 'Hawkeye' }));

      events = eventsMock();
      logger = loggerMock();

      reviewResult = {
        team: [{ login: 'Thor' }]
      };

      review = {
        review: sinon.stub().returns(promise(reviewResult))
      };

      action = { saveReview: sinon.stub().returns(promise(pullRequest)) };

      comment = {
        user: {
          login: 'Hulk'
        }
      };

      pullRequest = pullRequestMock();
      pullRequest.id = 42;
      pullRequest.state = 'open';
      pullRequest.review = {
        reviewers: [{ login: 'Hulk' }, { login: 'Spider-Man' }]
      };
      pullRequest.get.withArgs('review.reviewers').returns(clone(mockReviewers));

      options = {};
      imports = { team, action, logger, events, review };

      payload = { pullRequest, comment };
      command = service(options, imports);

    });

    it('should emit `review:command:busy` event', function (done) {
      command(payload, '/busy').then(() => {
        assert.calledWith(events.emit, 'review:command:busy');

        done();
      }, done);
    });

    it('should save pullRequest with new reviewer', function (done) {
      command(payload, '/busy')
        .then(() => {
          assert.calledWithMatch(action.saveReview, sinon.match(function (review) {

            assert.sameDeepMembers(
              review.reviewers,
              [{ login: 'Thor' }, { login: 'Spider-Man' }]
            );

            return true;

          }));

          done();
        })
        .catch(done);
    });

    it('should be rejected if author not in reviewers list', function (done) {
      payload.comment.user.login = 'Thor';

      pullRequest.review.reviewers = [
        { login: 'Hulk' },
        { login: 'Spider-Man' }
      ];

      command(payload, '/busy')
        .catch(() => done());
    });

    it('should be rejected if pull is closed', function (done) {
      pullRequest.state = 'closed';

      command(payload, '/busy')
        .catch(() => done());
    });

  });

});
