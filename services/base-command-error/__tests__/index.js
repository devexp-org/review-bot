import baseCommandError from '../../base-command-error';

describe.only('service/base-command-error', () => {
  const pullRequest = {};
  const user = {};
  const payload = { pullRequest, comment: { user } };
  const command = 'test';
  let service;
  let emit;
  beforeEach((done) => {
    emit = sinon.stub();

    baseCommandError({ event: 'review:command:error' }, { events: { emit } })
      .then(result => {
        service = result.service;
        done();
      });
  });

  it('should create custom error object with binded command, pullRequest and comment', () => {
    const result = service({}, command, payload);
    assert.propertyVal(result, 'command', command);
    assert.propertyVal(result, 'pullRequest', payload.pullRequest);
    assert.propertyVal(result, 'comment', payload.comment);
  });

  it('should keep passed error message builders', () => {
    const result = service({ messageBuilder() {} }, command, payload);
    assert.deepProperty(result, 'messageBuilder');
  });

  describe('#emitError', () => {
    let customError;

    beforeEach(() => {
      customError = service({
        messageBuilder() {
          return this.emitError('my message');
        }
      }, command, payload);
    });

    it('should emit error after calling one of the message builder', () => {
      customError.messageBuilder();
      assert.called(emit);
    });

    it('should emit error event with correct name', () => {
      customError.messageBuilder();
      assert.called(emit, 'review:command:error');
    });

    it('should have message, command, pullRequest, user', () => {
      customError.messageBuilder();
      assert.called(emit, { message: 'my message', command: 'test', pullRequest, user });
    });

    it('should return rejected promise', done => {
      customError.messageBuilder().then(null, () => done());
    });
  });
});
