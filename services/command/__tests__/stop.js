import service from '../stop';

describe('services/command/stop', () => {
  let action, pullRequest, team, events, payload;
  let logger;
  let comment;
  let command;

  beforeEach(() => {
    events = { emit: sinon.stub() };
    logger = { info: sinon.stub() };

    pullRequest = {
      state: 'open',
      user: { login: 'd4rkr00t' },
      review: { status: 'inprogress' }
    };

    comment = { user: { login: 'd4rkr00t' } };

    action = {
      saveReview: sinon.stub().returns(Promise.resolve(pullRequest)),

      approveReview: sinon.stub().returns(Promise.resolve(pullRequest))
    };

    command = service({}, { action, team, events, logger });

    payload = { pullRequest, comment };
  });

  it('should be rejected if pr is closed', done => {
    payload.pullRequest.state = 'closed';
    command(payload, '/stop').catch(() => done());
  });

  it('should be rejected if triggered by not an author', done => {
    payload.comment.user.login = 'blablabla';
    command(payload, '/stop').catch(() => done());
  });

  it('should be rejected if pull request review not in progress', done => {
    payload.pullRequest.review.status = 'complete';
    command(payload, '/stop').catch(() => done());
  });

  it('should trigger review:command:stop event', done => {
    command(payload, '/stop')
      .then(() => {
        assert.calledWith(events.emit, 'review:command:stop');
        done();
      })
      .catch(done);
  });
});
