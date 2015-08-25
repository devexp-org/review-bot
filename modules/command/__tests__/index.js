'use strict';

import CommandDispatcher from '../../command';

describe('modules/command', () => {

  it('should use empty array if commands list is not passed', () => {
    const dispatcher = new CommandDispatcher();

    assert.isArray(dispatcher.store);
    assert.lengthOf(dispatcher.store, 0);
  });

  describe('#dispatch', () => {
    const payload = { pullRequest: { id: 123 }, logger: { error: sinon.stub() } };
    const comment = 'first line\n/fireball\nthird line';

    let h1;
    let h2;
    let h3;
    let h4;

    beforeEach(() => {
      h1 = sinon.stub().returns(Promise.resolve(payload.pullRequest));
      h2 = sinon.stub().returns(Promise.resolve(payload.pullRequest));
      h3 = sinon.stub().returns(Promise.resolve(payload.pullRequest));
      h4 = sinon.stub().returns(Promise.reject('Error'));
    });

    it('should dispatch each line of user comment to each command', done => {
      const store = [
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

      dispatcher.dispatch(comment, payload).then(() => {
        assert.calledThrice(h1);
        assert.calledThrice(h2);
        assert.calledOnce(h3);
        done();
      }).catch(done);
    });

    it('should reject if any command was rejected', done => {
      const store = [
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

      dispatcher.dispatch(comment, payload).catch(() => done());
    });

    it('should pass updated pull request for next command', done => {
      const pullRequestUpdated = { id: 123, updated: true };
      const h5 = sinon.stub().returns(Promise.resolve(pullRequestUpdated));
      const h6 = (comment, payload) => {
        assert.equal(payload.pullRequest, pullRequestUpdated);
        done();
      };
      const store = [
        {
          test: /.*/,
          handlers: [h5]
        },
        {
          test: /\/fireball/,
          handlers: [h6]
        }
      ];

      const dispatcher = new CommandDispatcher(store);

      dispatcher.dispatch(comment, payload).catch(done);
    });
  });

});
