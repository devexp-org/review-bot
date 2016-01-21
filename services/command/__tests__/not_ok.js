import { cloneDeep } from 'lodash';

import service from '../not_ok';
import teamMock from '../../choose-team/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import { mockReviewers } from '../__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull_request';


describe('services/command/not_ok', () => {

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
        status: 'notstarted',
        reviewers: cloneDeep(mockReviewers)
      };
      pullRequest.get.withArgs('review.reviewers').returns(cloneDeep(mockReviewers));

      options = {};
      imports = { team, action, logger, events, review };

      payload = { pullRequest, comment };
      command = service(options, imports);

    });

    it('should emit `review:command:not_ok` event', function (done) {
      command(payload, '/not_ok').then(() => {
        assert.calledWith(events.emit, 'review:command:not_ok');

        done();
      }, done);
    });

    it('should change status from `complete` to `notstarted`', function (done) {
      pullRequest.review.status = 'complete';

      command(payload, '/not_ok')
        .then(() => {
          assert.calledWithMatch(action.saveReview, sinon.match(function (review) {
            assert.equal(review.status, 'notstarted');
            return true;
          }));

          done();
        })
        .catch(done);
    });

    it('should be rejected if author not in reviewers list', function (done) {
      payload.comment.user.login = 'Spider-Man';

      pullRequest.review.reviewers = [
        { login: 'Hulk' },
        { login: 'Thor' }
      ];

      command(payload, '/not_ok')
        .catch(() => done());
    });

  });

});
