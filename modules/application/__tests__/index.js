'use strict';

import path from 'path';
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
          dependencies: ['serviceB', 'serviceC', 'serviceD']
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
        },
        serviceD: {
          module: function () {
            return Promise.resolve({ service: 'moduleD' });
          }
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .then(resolved => {
        assert.deepEqual(resolved, {
          serviceA: 'moduleA',
          serviceB: 'moduleB',
          serviceC: 'moduleC',
          serviceD: 'moduleD'
        });
        done();
      })
      .catch(done);

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

  it('should skip ignored services', function (done) {
    const order = [];

    config = {
      services: {
        serviceA: {
          module: function () {
            order.push('serviceA');
            return Promise.resolve({ service: 'moduleA' });
          }
        },
        serviceB: {
          ignore: true,
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
        assert.deepEqual(order, ['serviceA']);
        assert.deepEqual(resolved, { serviceA: 'moduleA' });
        done();
      })
      .catch(done);

  });

  it('should reject promise if error occurs in service requiring', function (done) {
    config = {
      services: {
        serviceA: {
          path: 'path/not/exists'
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .catch(e => {
        assert.instanceOf(e, Error);
        assert.match(e.message, /path\/not\/exists/i);
        done();
      });

  });

  it('should reject promise if error occurs in service startup', function (done) {
    config = {
      services: {
        serviceA: {
          module: function () {
            throw new Error('Error in serviceA');
          }
        }
      }
    };

    app = new Application(config);

    app
      .execute()
      .catch(e => {
        assert.instanceOf(e, Error);
        assert.match(e.message, /Error in serviceA/i);
        done();
      });

  });

  it('should throw an error if startup of module timeouted', function (done) {
    config = {
      startup_timeout: 10,
      services: {
        serviceA: {
          module: function () {
            return new Promise(resolve => {
              setTimeout(function () {
                resolve({ service: 'serviceA' });
              }, 20);
            });
          }
        }
      }
    };

    app = new Application(config);
    app
      .execute()
      .then(done)
      .catch(e => {
        assert.instanceOf(e, Error);
        assert.match(e.message, /timeout/i);
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

  describe('#values', function () {

    it('should return array of object values without keys', function () {
      const test = { a: 'aa', b: 'bb' };

      assert.deepEqual(Application.values(test), ['aa', 'bb']);
    });

  });

  describe('#shutdown', function () {

    it('should gracefuly shutdown services', function (done) {
      const order = [];

      config = {
        services: {
          serviceA: {
            module: function () {
              order.push('start serviceA');
              return Promise.resolve({
                service: 'moduleA',
                shutdown: function () {
                  order.push('shutdown serviceA');
                  return Promise.resolve();
                }
              });
            },
            dependencies: ['serviceB']
          },
          serviceB: {
            module: function () {
              order.push('start serviceB');
              return Promise.resolve({
                service: 'moduleB',
                shutdown: function () {
                  order.push('shutdown serviceB');
                  return Promise.resolve();
                }
              });
            }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .then(::app.shutdown)
        .then(() => {
          assert.deepEqual(order, [
            'start serviceB',
            'start serviceA',
            'shutdown serviceB',
            'shutdown serviceA'
          ]);
          done();
        })
        .catch(done);
    });

    it('should throw an error if app is not fully started', function () {
      app = new Application({});

      try {
        app.shutdown();
        assert.fail('it should fail');
      } catch (e) {
        assert.instanceOf(e, Error);
        assert.match(e.message, /started/i);
      }
    });

    it('should throw an error if shutdown function timeouted', function (done) {
      config = {
        shutdown_timeout: 10,
        services: {
          serviceA: {
            module: function () {
              return Promise.resolve({
                service: 'moduleA',
                shutdown: function () {
                  return new Promise(resolve => {
                    setTimeout(function () { resolve({ service: 'serviceA' }); }, 20);
                  });
                }
              });
            }
          },
          serviceB: {
            module: function () {
              return Promise.resolve({ service: 'serviceB' });
            }
          }
        }
      };

      app = new Application(config);
      app
        .execute()
        .then(::app.shutdown)
        .then(done)
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(e.message, /timeout/i);
          done();
        });
    });

  });

  describe('require', function (done) {

    it('`require` is is forbidden service name', function () {
      config = {
        services: {
          require: {
            module: function () {
              return Promise.resolve({ service: 'service' });
            }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(e.message, /is forbidden/i);
          done();
        });
    });

    it('`requireDefault` is is forbidden service name', function () {
      config = {
        services: {
          requireDefault: {
            module: function () {
              return Promise.resolve({ service: 'service' });
            }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(e.message, /is forbidden/i);
          done();
        });
    });

    it('`require` is is forbidden alias', function () {
      config = {
        services: {
          serviceA: {
            module: function () {
              return Promise.resolve({ service: 'serviceA' });
            }
          },
          serviceB: {
            module: function () {
              return Promise.resolve({ service: 'serviceB' });
            },
            dependencies: { require: 'serviceA' }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(e.message, /is forbidden/i);
          done();
        });
    });

    it('`require` is is forbidden alias', function () {
      config = {
        services: {
          serviceA: {
            module: function () {
              return Promise.resolve({ service: 'serviceA' });
            }
          },
          serviceB: {
            module: function () {
              return Promise.resolve({ service: 'serviceB' });
            },
            dependencies: { requireDefault: 'serviceA' }
          }
        }
      };

      app = new Application(config);

      app
        .execute()
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(e.message, /is forbidden/i);
          done();
        });
    });

    it('#require should join path with `basePath`', function () {
      app = new Application({}, path.join(__dirname, 'mocks'));

      assert.deepEqual(app.require('./test'), './mocks/test.js');
    });

    it('#require should not join path with `basePath` if path starts with `/`', function () {
      app = new Application({}, path.join(__dirname, 'mocks'));
      const absolutePath = path.join(__dirname, 'mocks', 'test.js');

      assert.deepEqual(app.require(absolutePath), './mocks/test.js');
    });

    it('#requireDefault should return default export', function () {
      app = new Application({}, path.join(__dirname, 'mocks'));

      assert.deepEqual(app.requireDefault('./test'), './mocks/test.js');
      assert.deepEqual(app.requireDefault('./es6.js'), './mocks/es6.js');
    });

  });

});
