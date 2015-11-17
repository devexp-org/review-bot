import { clone } from 'lodash';

import { addNewReviewerAndApprove } from '../ok';
import { mockReviewers } from './mocks';

describe('services/command/ok', () => {
  describe('#addNewReviewerAndApprove', () => {
    let action, pullRequest, team, events, payload;

    beforeEach(() => {
      pullRequest = { state: 'open', get: sinon.stub().returns(clone(mockReviewers)), id: 1 };
      team = { findTeamMemberByPullRequest: sinon.stub().returns(Promise.resolve({ login: 'Hawkeye' })) };
      events = { emit: sinon.stub() };

      action = {
        save(reviewers) {
          pullRequest.review = reviewers;

          return pullRequest;
        },

        approveReview: sinon.stub().returns(Promise.resolve(pullRequest))
      };

      payload = { pullRequest, action, team, events };
    });

    it('should be rejected if pull request is not open', done => {
      pullRequest.state = 'closed';

      addNewReviewerAndApprove(payload, 'Hulk').catch(() => done());
    });

    it('should be rejected if there is no user with given login in team', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve(null));

      addNewReviewerAndApprove(payload, 'Hulk').catch(() => done());
    });

    it('should add new reviewer to pull request', done => {
      addNewReviewerAndApprove(payload, 'Hawkeye')
        .then(pullRequest => {
          assert.deepEqual(pullRequest.review.reviewers, [{ login: 'Hulk' }, { login: 'Thor' }, { login: 'Hawkeye' }]);
          done();
        })
        .catch(done);
    });

    it('should emit review:command:ok:new_reviewer event', done => {
      addNewReviewerAndApprove(payload, 'Hawkeye')
        .then(pullRequest => {
          assert.calledWith(events.emit, 'review:command:ok:new_reviewer');
          done();
        })
        .catch(done);
    });
  });
});
