import PluginBroker from '../class';

describe('services/model/class', function () {

  let model;

  beforeEach(function() {
    model = {
      plugin: sinon.stub()
    };
  });

  it('should be able to add plugin', function () {
    const plugin = sinon.stub();

    const broker = new PluginBroker({ modelA: [plugin] });
    broker.setupModel('modelA', model);

    assert.calledWith(model.plugin, plugin);
  });

  it('should not throw an error if broker has no plugins', function () {
    const broker = new PluginBroker();
    broker.setupModel('modelA', model);

    assert.notCalled(model.plugin);
  });

});
