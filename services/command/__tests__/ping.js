import service from '../ping';

describe('services/command/ping', () => {

  let command;
  let payload;
  let logger;
  let events;

  beforeEach(() => {
    events = { emit: sinon.stub() };
    logger = { info: sinon.stub() };

    command = service({}, { logger, events });

    payload = {
      pullRequest: {
        state: 'open',
        user: { login: 'd4rkr00t' }
      },
      comment: { user: { login: 'd4rkr00t' } }
    };
  });

  it('should be rejected if pr is closed', done => {
    payload.pullRequest.state = 'closed';
    command(payload, '/ping').catch(() => done());
  });

  it('should be rejected if triggered by not an author', done => {
    payload.comment.user.login = 'blablabla';
    command(payload, '/ping').catch(() => done());
  });

  it('should trigger review:command:ping event', done => {
    command(payload, '/ping')
      .then(() => {
        assert.calledWith(events.emit, 'review:command:ping');
        done();
      })
      .catch(done);
  });

});
