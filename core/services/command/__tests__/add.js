import { cloneDeep } from 'lodash';

import parseLogins from '../../parse-logins/parse-logins';

import service from '../commands/add';
import { getParticipants } from '../commands/add';
import { mockReviewers } from './mocks';

describe('services/command/add', () => {
  describe('#getParticipants', () => {
    it('should get participant from command like /add @username', () => {
      assert.equal(getParticipants('/add @username', parseLogins), 'username');
      assert.equal(getParticipants('Text \n/add @username\nOther text', parseLogins), 'username');
    });

    it('should get multiple participants from commands like /add username1 username2', () => {
      assert.deepEqual(
        getParticipants('Text \n/add username1 username2\nOther text', parseLogins),
        ['username1', 'username2']
      );
      assert.deepEqual(
        getParticipants('Text \n/add @username1 @username2\nOther text', parseLogins),
        ['username1', 'username2']
      );
    });

    it('should get participant from command like /add username', () => {
      assert.equal(getParticipants('/add username', parseLogins), 'username');
      assert.equal(getParticipants('Text \n/add username\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like +@username', () => {
      assert.equal(getParticipants('+@username', parseLogins), 'username');
      assert.equal(getParticipants('Text \n+@username\nOther text', parseLogins), 'username');
    });

    it('should get participant from command like +username', () => {
      assert.equal(getParticipants('+username', parseLogins), 'username');
      assert.equal(getParticipants('Text \n+username\nOther text', parseLogins), 'username');
    });
  });

  describe('#addCommand', () => {
    let command, pullRequest, payload, action, events, team;

    beforeEach(() => {
      team = { findTeamMemberByPullRequest: sinon.stub().returns(Promise.resolve({ login: 'Hawkeye' })) };
      action = { save: sinon.stub().returns(Promise.resolve(pullRequest)) };
      events = { emit: sinon.stub() };
      pullRequest = { id: 1, get: sinon.stub().returns(cloneDeep(mockReviewers)) };

      const commandLog = sinon.stub();
      const logger = { info: sinon.stub() };
      const comment = { user: { login: 'd4rkr00t' } };

      command = service({}, { team, action, logger, events, parseLogins });
      payload = { pullRequest, comment, commandLog };
    });

    it('should be rejected if cannot parse command', done => {
      command('/add 1alkdkd', payload).catch(() => done());
    });

    it('should be rejected if user is already in reviewers list', done => {
      command('/add Hulk', payload).catch(() => done());
    });

    it('should be rejected if no such user in team', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve(null));

      command('/add Hulfk', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewer', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve({ login: 'Hawkeye' }));

      command('/add Hawkeye', payload).then(() => {
        const resultReviewers = cloneDeep(mockReviewers);
        resultReviewers.push({ login: 'Hawkeye' });

        assert.calledWith(action.save, { reviewers: resultReviewers });
        done();
      }, done);
    });

    it('should emit `review:command:add` event', done => {
      command('/add Hawkeye', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:add');

        done();
      }, done);
    });

  });

});
