import { clone } from 'lodash';

import service from '../ok';
import { mockReviewers } from './mocks';

describe('services/command/ok', () => {
  let action, pullRequest, team, events, payload;
  let logger;
  let comment;
  let command;

  beforeEach(() => {
    pullRequest = {
      id: 1,
      state: 'open',
      user: { login: 'Hulk' },
      get: sinon.stub().returns(clone(mockReviewers))
    };
    team = {
      findTeamMemberByPullRequest: sinon.stub().returns(
        Promise.resolve({ login: 'Hawkeye' })
      )
    };
    events = { emit: sinon.stub() };
    logger = { info: sinon.stub() };
    comment = {
      user: {
        login: 'Hawkeye'
      }
    };

    action = {
      save(reviewers) {
        pullRequest.review = reviewers;

        return pullRequest;
      },

      approveReview: sinon.stub().returns(Promise.resolve(pullRequest))
    };

    command = service({}, { action, team, events, logger });

    payload = { pullRequest, comment };
  });

  it('should be rejected if pull request is not open', done => {
    pullRequest.state = 'closed';

    command('/ok', payload).catch(() => done());
  });

  it('should be rejected if author of pull tried to /ok his own pull request', done => {
    pullRequest.user = { login: 'Hawkeye' };

    command('/ok', payload).catch(() => done());
  });

  it('should be rejected if there is no user with given login in team', done => {
    team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve(null));

    command('/ok', payload).catch(() => done());
  });

  it('should add new reviewer to pull request', done => {
    command('/ok', payload)
      .then(pullRequest => {
        assert.deepEqual(
          pullRequest.review.reviewers,
          [{ login: 'Hulk' }, { login: 'Thor' }, { login: 'Hawkeye' }]
        );
        done();
      })
      .catch(done);
  });

  it('should emit review:command:ok:new_reviewer event', done => {
    command('/ok', payload)
      .then(pullRequest => {
        assert.calledWith(events.emit, 'review:command:ok:new_reviewer');
        done();
      })
      .catch(done);
  });
});
