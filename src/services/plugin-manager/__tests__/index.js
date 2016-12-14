import service from '../';

describe('services/plugin-manager', function () {

  let options, imports, app, config;

  beforeEach(function () {

    config = {
      services: {
        serviceA: {
          module: function () { return 'moduleA'; }
        },
        serviceB: {
          module: function () { return 'moduleB'; },
          '#plugin:serviceA': {
            foo: 'bar'
          }
        }
      }
    };

    app = {
      getConfig: sinon.stub().returns(config),
      setOption: sinon.stub(),
      addOptions: sinon.stub(),
      addDependency: sinon.stub()
    };

    imports = { __app__: app };

  });

  it('should add options and dependency to given service', function () {
    service(options, imports);

    assert.calledWith(app.addOptions, 'serviceA', { foo: 'bar' });
    assert.calledWith(app.addDependency, 'serviceA', 'serviceB');
  });

});
