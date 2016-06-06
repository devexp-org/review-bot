import CommandDispatcher from '../class';

describe('services/command/class', function () {

  it('should use an empty array if commands list is not passed', function () {
    const dispatcher = new CommandDispatcher();

    assert.isArray(dispatcher.store);
    assert.lengthOf(dispatcher.store, 0);
  });

  describe('#dispatch', function () {

    let h1, h2, h3, h4;
    let payload, comment, store;

    beforeEach(function () {
      h1 = sinon.stub().returns(Promise.resolve());
      h2 = sinon.stub().returns(Promise.resolve());
      h3 = sinon.stub().returns(Promise.resolve());
      h4 = sinon.stub().returns(Promise.reject(new Error()));

      store = [];
      payload = {};
      comment = 'first line\n/fireball\nthird line';
    });

    it('should dispatch each line of user comment to each command', function (done) {
      store = [
        {
          test: /.*/,
          handlers: [h1, h2]
        },
        {
          test: /\/fireball/,
          handlers: [h3]
        }
      ];

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload)
        .then(() => {
          assert.calledThrice(h1);
          assert.calledThrice(h2);
          assert.calledOnce(h3);
        })
        .then(done, done);
    });

    it('should return rejected promise if any command is rejected', function (done) {
      store = [
        {
          test: /.*/,
          handlers: [h1, h4]
        },
        {
          test: /\/fireball/,
          handlers: [h3]
        }
      ];

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload)
        .then(() => { throw new Error('should reject promise'); })
        .catch(error => assert.notMatch(error.message, /should reject promise/))
        .then(done, done);
    });

    it('should pass parsed arguments from RegExp to handler', function (done) {
      store = [
        {
          test: /\/change @(\w+) to @(\w+)/,
          handlers: [h1]
        }
      ];

      comment = '/change @old to @new';

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload)
        .then(() => assert.calledWith(h1, comment, payload, sinon.match(function (arglist) {
          assert.deepEqual(arglist, ['old', 'new']);
          return true;
        })))
        .then(done, done);
    });

  });

});
