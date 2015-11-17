import command from '../stop';

describe('services/command/stop', () => {
  let payload;

  beforeEach(() => {
    payload = {
      pullRequest: {
        state: 'open',
        user: { login: 'd4rkr00t' },
        review: { status: 'inprogress' }
      },
      action: { save: sinon.stub().returns(Promise.resolve()) },
      comment: { user: { login: 'd4rkr00t' } },
      events: { emit: sinon.stub() },
      logger: { info: sinon.stub() }
    };
  });

  it('should be rejected if pr is closed', done => {
    payload.pullRequest.state = 'closed';
    command('', payload).catch(() => done());
  });

  it('should be rejected if triggered by not an author', done => {
    payload.comment.user.login = 'blablabla';
    command('', payload).catch(() => done());
  });

  it('should be rejected if pull request review not in progress', done => {
    payload.pullRequest.review.status = 'complete';
    command('', payload).catch(() => done());
  });

  it('should trigger review:command:stop event', done => {
    command('', payload)
      .then(() => {
        assert.calledWith(payload.events.emit, 'review:command:stop');
        done();
      })
      .catch(done);
  });
});
