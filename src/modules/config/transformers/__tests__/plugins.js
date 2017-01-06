import pluginsTransformer from '../plugins';

describe('modules/config/transformers/plugins', function () {

  let transformer;

  beforeEach(function () {
    transformer = pluginsTransformer();
  });

  it('should parse #plugin directive', function () {

    const config = {
      services: {
        http: {
          path: './http.js',
          options: { port: 80 },
          dependencies: []
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        http: {
          path: './http.js',
          options: {
            port: 80,
            'static-path': './public'
          },
          dependencies: ['http-static']
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should not apply #plugin directive if the service ignored', function () {

    const config = {
      services: {
        http: {
          path: './http.js',
          options: { port: 80 },
          dependencies: []
        },
        'http-static': {
          path: './http-static.js',
          ignore: true,
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        http: {
          path: './http.js',
          options: { port: 80 },
          dependencies: []
        },
        'http-static': {
          path: './http-static.js',
          ignore: true,
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should create `options` and `dependencies` if needed', function () {

    const config = {
      services: {
        http: { path: './http.js' },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        http: {
          path: './http.js',
          options: {
            'static-path': './public'
          },
          dependencies: ['http-static']
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should be able to handle `dependencies` object', function () {

    const config = {
      services: {
        http: {
          path: './http.js',
          dependencies: {
            logger: 'syslog'
          }
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        http: {
          path: './http.js',
          options: {
            'static-path': './public'
          },
          dependencies: {
            logger: 'syslog',
            'http-static': 'http-static'
          }
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            'static-path': './public'
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should merge options properly', function () {

    const config = {
      services: {
        http: {
          path: './http.js',
          options: {
            path: ['foo', 'bar']
          },
          dependencies: []
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            path: ['baz']
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        http: {
          path: './http.js',
          options: {
            path: ['foo', 'bar', 'baz']
          },
          dependencies: ['http-static']
        },
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            path: ['baz']
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

  it('should not throw an error if service is not found', function () {

    const config = {
      services: {
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            path: ['baz']
          }
        }
      }
    };

    const actual = transformer(config);
    const expected = {
      services: {
        'http-static': {
          path: './http-static.js',
          '#plugin:http': {
            path: ['baz']
          }
        }
      }
    };

    assert.deepEqual(actual, expected);
  });

});
