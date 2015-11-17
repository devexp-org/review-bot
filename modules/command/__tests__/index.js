'use strict';

import CommandDispatcher from '../../command';

describe('modules/command', () => {

  it('should use empty array if commands list is not passed', () => {
    const dispatcher = new CommandDispatcher();

    assert.isArray(dispatcher.store);
    assert.lengthOf(dispatcher.store, 0);
  });

  describe('#dispatch', () => {
    const payload = {};
    const comment = 'first line\n/fireball\nthird line';

    let h1, h2, h3, h4;

    beforeEach(() => {
      h1 = sinon.stub().returns(Promise.resolve());
      h2 = sinon.stub().returns(Promise.resolve());
      h3 = sinon.stub().returns(Promise.resolve());
      h4 = sinon.stub().returns(Promise.reject(new Error()));
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

  });

});
