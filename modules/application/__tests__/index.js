'use strict';

import Application from '../../application';

// TODO when all ignored
describe('modules/application', function () {

  let app, config;

  it('should properly resolve dependencies', function (done) {
    const order = [];

    config = {
      services: {
        serviceA: {
          module: function () {
            order.push('serviceA');
            return Promise.resolve({ service: 'moduleA' });
          },
          dependencies: ['serviceB']
        },
        serviceB: {
          module: function () {
            order.push('serviceB');
            return Promise.resolve({ service: 'moduleB' });
          }
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .then(function (resolved) {
        assert.deepEqual(order, ['serviceB', 'serviceA']);
        assert.deepEqual(resolved, { serviceA: 'moduleA', serviceB: 'moduleB' });
        done();
      })
      .catch(done);

  });

  it('should properly resolve async dependencies', function (done) {
    config = {
      services: {
        serviceA: {
          module: function () {
            return new Promise(resolve => {
              setTimeout(function () { resolve({ service: 'moduleA' }); }, 10);
            });
          },
          dependencies: ['serviceB', 'serviceC']
        },
        serviceB: {
          module: function () {
            return new Promise(resolve => {
              setTimeout(function () { resolve({ service: 'moduleB' }); }, 15);
            });
          }
        },
        serviceC: {
          module: function () {
            return new Promise(resolve => {
              setTimeout(function () { resolve({ service: 'moduleC' }); }, 20);
            });
          }
        }
      }
    };

    app = new Application(config);

    app.execute().then(() => done()).catch(done);

  });

  it('should pass options and imports to service', function (done) {
    config = {
      services: {
        serviceA: {
          module: function (o, i) {
            assert.equal(o.A, 'A');
            assert.equal(o.B, 'B');
            assert.equal(i.serviceB, 'moduleB');

            return Promise.resolve({ service: 'moduleA' });
          },
          options: { A: 'A', B: 'B' },
          dependencies: ['serviceB']
        },
        serviceB: {
          module: function () {
            return Promise.resolve({ service: 'moduleB' });
          }
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .then(function () { done(); });

  });

  it('should detect circular dependency', function (done) {
    config = {
      services: {
        serviceA: {
          module: function () {
            return Promise.resolve({ service: 'moduleA' });
          },
          dependencies: ['serviceB']
        },
        serviceB: {
          module: function () {
            return Promise.resolve({ service: 'moduleB' });
          },
          dependencies: ['serviceC']
        },
        serviceC: {
          module: function () {
            return Promise.resolve({ service: 'moduleC' });
          },
          dependencies: ['serviceA']
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .catch(function (e) {
        assert.instanceOf(e, Error);
        assert.match(e.message, /circular dependency detected/i);
        done();
      });

  });

  it('should throw an error if dependency was not found', function (done) {
    config = {
      services: {
        serviceA: {
          module: function () {
            return Promise.resolve({ service: 'moduleA' });
          },
          dependencies: ['serviceB']
        }
      }
    };

    app = new Application(config);

    app.execute()
      .catch(function (e) {
        assert.instanceOf(e, Error);
        assert.match(e.message, /dependency .* not found/i);
        done();
      });
  });

  it('should not allow to execute an application twice', function () {
    app = new Application();

    app.execute();

    assert.throws(
      app.execute.bind(app),
      /cannot execute the application twice/i
    );
  });

});
