import { clone } from 'lodash';

import service from '../remove';
import { getParticipant } from '../remove';
import { mockReviewers } from './mocks';

describe('services/command/remove', () => {

  describe('#getParticipant', () => {

    it('should get participant from command like /remove @username', () => {
      assert.equal(getParticipant('/remove @username'), 'username');
      assert.equal(getParticipant('Text \n/remove @username\nOther text'), 'username');
      assert.equal(getParticipant(' /remove @username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like /remove username', () => {
      assert.equal(getParticipant('/remove username'), 'username');
      assert.equal(getParticipant('Text \n/remove username\nOther text'), 'username');
      assert.equal(getParticipant(' /remove username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like -@username', () => {
      assert.equal(getParticipant('-@username'), 'username');
      assert.equal(getParticipant('Text \n-@username\nOther text'), 'username');
      assert.equal(getParticipant(' -@username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like -username', () => {
      assert.equal(getParticipant('-username'), 'username');
      assert.equal(getParticipant('Text \n-username\nOther text'), 'username');
      assert.equal(getParticipant(' -username and some more text\nOther text'), 'username');
    });

    it('should get participant from command like -user-name', () => {
      assert.equal(getParticipant('-user-name'), 'user-name');
      assert.equal(getParticipant('Text \n-user-name\nOther text'), 'user-name');
      assert.equal(getParticipant(' -user-name and some more text\nOther text'), 'user-name');
    });

    it('should get participant from command like /remove user-name', () => {
      assert.equal(getParticipant('/remove user-name'), 'user-name');
      assert.equal(getParticipant('Text \n/remove user-name\nOther text'), 'user-name');
      assert.equal(getParticipant(' /remove user-name and some more text\nOther text'), 'user-name');
    });
  });

  describe('#removeCommand', () => {
    let command;
    let pullRequest;
    let payload;
    let action;
    let events;
    let logger;
    let comment;

    beforeEach(() => {
      action = { save: sinon.stub().returns(Promise.resolve(pullRequest)) };
      events = { emit: sinon.stub() };
      logger = { info: sinon.stub() };
      comment = {
        user: {
          login: 'd4rkr00t'
        }
      };
      pullRequest = {
        id: 1,
        get: sinon.stub().returns(clone(mockReviewers))
      };

      payload = { pullRequest, comment };

      command = service({ min: 1 }, { action, logger, events });
    });

    it('should be rejected if user is not in reviewers list', done => {
      command('/remove Hawkeye', payload).catch(() => done());
    });

    it('should be rejected if there only 1 reviewer in reviewers list', done => {
      pullRequest.get = sinon.stub().returns(['']);

      command('/remove Hulk', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewers list', done => {
      command('/remove Hulk', payload).then(() => {
        assert.called(action.save);
        done();
      }, done);
    });

    it('should emit `review:command:remove` event', done => {
      command('/remove Hulk', payload).then(() => {
        assert.calledWith(events.emit, 'review:command:remove');

        done();
      }, done);
    });

  });

});
