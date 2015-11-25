import { clone } from 'lodash';

import service from '../change';
import { getParticipant } from '../change';
import { mockReviewers } from './mocks';

describe('services/command/change', () => {

  describe('#getParticipant', () => {

    it('should get participant from command like /change Hulk to Hawkeye', () => {
      const expected = { oldReviewerLogin: 'Hulk', newReviewerLogin: 'Hawkeye' };

      assert.deepEqual(getParticipant('/change Hulk to Hawkeye'), expected);
      assert.deepEqual(getParticipant('Text \n/change Hulk to Hawkeye\nOther text'), expected);
      assert.deepEqual(getParticipant(' /change Hulk to Hawkeye and some more text\nOther text'), expected);

      assert.deepEqual(getParticipant('/change @Hulk to @Hawkeye'), expected);
      assert.deepEqual(getParticipant('Text \n/change @Hulk to @Hawkeye\nOther text'), expected);
      assert.deepEqual(getParticipant(' /change @Hulk to @Hawkeye and some more text\nOther text'), expected);
    });

    it('should get participant from command like /change Hulk Hawkeye', () => {
      const expected = { oldReviewerLogin: 'Hulk', newReviewerLogin: 'Hawkeye' };

      assert.deepEqual(getParticipant('/change Hulk Hawkeye'), expected);
      assert.deepEqual(getParticipant('Text \n/change Hulk Hawkeye\nOther text'), expected);
      assert.deepEqual(getParticipant(' /change Hulk Hawkeye and some more text\nOther text'), expected);

      assert.deepEqual(getParticipant('/change @Hulk @Hawkeye'), expected);
      assert.deepEqual(getParticipant('Text \n/change @Hulk @Hawkeye\nOther text'), expected);
      assert.deepEqual(getParticipant(' /change @Hulk @Hawkeye and some more text\nOther text'), expected);
    });

  });

  describe('#changeCommand', () => {
    let pullRequest;
    let payload;
    let action;
    let events;
    let logger;
    let team;
    let comment;
    let command;

    beforeEach(() => {
      pullRequest = {
        id: 1,
        get: sinon.stub().returns(clone(mockReviewers)),
        user: { login: 'd4rkr00t' },
        state: 'open'
      };
      team = {
        findTeamMemberByPullRequest: sinon.stub().returns(
          Promise.resolve({ login: 'Spider-Man' })
        )
      };
      action = {
        save(reviewers) {
          pullRequest.review = reviewers;

          return pullRequest;
        }
      };
      events = { emit: sinon.stub() };
      logger = { info: sinon.stub() };
      comment = {
        user: {
          login: 'd4rkr00t'
        }
      };

      command = function (comment, payload) {
        return service({}, { team, action, logger, events })
          .then(resolved => resolved.service(comment, payload));
      };
      payload = { pullRequest, comment };

    });

    it('should be rejected if pull request is closed', done => {
      pullRequest.state = 'closed';

      command('/change Hulk to Hawkeye', payload).catch(() => done());
    });

    it('should be rejected if we can`t parse participants from command', done => {
      command('/change Hawkeye', payload).catch(() => done());
    });

    it('should be rejected if called from not an author of pull request', done => {
      pullRequest.user.login = 'Hawkeye';

      command('/change Hawkeye to Hulk', payload).catch(() => done());
    });

    it('should be rejected if old reviewer not in reviewers list', done => {
      command('/change Hawkeye to Spider-Man', payload).catch(() => done());
    });

    it('should be rejected if new reviewer already in reviewers list', done => {
      command('/change Thor to Hulk', payload).catch(() => done());
    });

    it('should be rejected if author tries to set himself as reviewer', done => {
      command('/change Thor to d4rkr00t', payload).catch(() => done());
    });

    it('should be rejected if new reviewer is not in team', done => {
      team.findTeamMemberByPullRequest = sinon.stub().returns(Promise.resolve(null));

      command('/change Thor to blablabla', payload).catch(() => done());
    });

    it('should save pullRequest with new reviewer', done => {
      command('/change Thor to Spider-Man', payload).then(() => {
        const resultReviewers = [
          { login: 'Hulk' },
          { login: 'Spider-Man' }
        ];

        assert.deepEqual(pullRequest.review.reviewers, resultReviewers);

        done();
      }, done);
    });

  });

});
