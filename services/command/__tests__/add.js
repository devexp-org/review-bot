import { clone } from 'lodash';

import command from '../add';
import { getParticipant } from '../add';
import { mockReviewers } from './mocks';

describe('services/command/add', () => {
  describe('#getParticipant', () => {
    it('should get participant from command like /add @username', () => {
      assert.equal(getParticipant('/add @username'), 'username');
      assert.equal(getParticipant('Text \n/add @username\nOther text'), 'username');
      assert.equal(getParticipant(' /add @username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like /add username', () => {
      assert.equal(getParticipant('/add username'), 'username');
      assert.equal(getParticipant('Text \n/add username\nOther text'), 'username');
      assert.equal(getParticipant(' /add username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like +@username', () => {
      assert.equal(getParticipant('+@username'), 'username');
      assert.equal(getParticipant('Text \n+@username\nOther text'), 'username');
      assert.equal(getParticipant(' +@username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like +username', () => {
      assert.equal(getParticipant('+username'), 'username');
      assert.equal(getParticipant('Text \n+username\nOther text'), 'username');
      assert.equal(getParticipant(' +username and some more text\nOther text'), 'username');
    });
  });

  describe('#addCommand', () => {
    let pullRequest;
    let payload;
    let action;
    let events;
    let logger;
    let team;
    let comment;

    beforeEach(() => {
      pullRequest = { get: sinon.stub().returns(clone(mockReviewers)), id: 1 };
      team = { findTeamMemberByPullRequest: sinon.stub().returns(Promise.resolve([{ login: 'Hawkeye' }])) };
      action = { save: sinon.stub().returns(Promise.resolve(pullRequest)) };
      events = { emit: sinon.stub() };
      logger = { info: sinon.stub() };
      comment = {
        user: {
          login: 'd4rkr00t'
        }
      };

      payload = { pullRequest, action, events, logger, team, comment };
    });

    it('should be rejected if user is already in reviewers list', done => {
      command('/add Hulk', payload).catch(() => done());
    });

    it('should be rejected if no such user in team', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve([]));

      command('/add Hulfk', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewer', done => {
      command('/add Hawkeye', payload).then(() => {
        const resultReviewers = clone(mockReviewers);
        resultReviewers.push({ login: 'Hawkeye' });

        assert.called(action.save);
        assert.deepEqual(pullRequest.get('review.reviewers'), resultReviewers);

        done();
      }, done);
    });

    it('should emmit `review:command:add` event', done => {
      command('/add Hawkeye', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:add');

        done();
      }, done);
    });
  });
});
