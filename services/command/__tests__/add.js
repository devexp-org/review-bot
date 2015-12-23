import { clone } from 'lodash';

import service from '../add';
import { getParticipant } from '../add';
import { mockReviewers } from '../__mocks__/index';

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
    let command;
    let pullRequest;
    let payload;
    let action;
    let events;
    let logger;
    let team;
    let comment;

    const promise = (x) => Promise.resolve(x);

    beforeEach(() => {
      team = {
        findTeamMemberByPullRequest: sinon.stub().returns(
          promise({ login: 'Hawkeye' })
        )
      };
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

      command = service({}, { team, action, logger, events });
      payload = { pullRequest, comment };
    });

    it('should be rejected if user is already in reviewers list', done => {
      command(payload, '/add Hulk').catch(() => done());
    });

    it('should be rejected if no such user in team', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve(null));

      command(payload, '/add Hulfk').catch(() => done());
    });

    it('should save pullRequest with new reviewer', done => {
      command(payload, '/add Hawkeye').then(() => {
        const resultReviewers = clone(mockReviewers);
        resultReviewers.push({ login: 'Hawkeye' });

        assert.called(action.save);
        assert.deepEqual(pullRequest.get('review.reviewers'), resultReviewers);

        done();
      }, done);
    });

    it('should emit `review:command:add` event', done => {
      command(payload, '/add Hawkeye').then(() => {
        assert.calledWith(events.emit, 'review:command:add');

        done();
      }, done);
    });

  });

});
