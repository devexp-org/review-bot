import command from '../ping';

describe('services/command/ping', () => {
  let payload;

  beforeEach(() => {
    payload = {
      pullRequest: {
        state: 'open',
        user: { login: 'd4rkr00t' }
      },
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

  it('should trigger review:command:ping event', done => {
    command('', payload)
      .then(() => {
        assert.calledWith(payload.events.emit, 'review:command:ping');
        done();
      })
      .catch(done);
  });
});
