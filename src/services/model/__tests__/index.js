import service from '../';

describe('services/model', function () {

  let options, imports, mongoose;
  let plugin1, plugin2, testModel;

  beforeEach(function () {

    mongoose = { model: sinon.stub() };

    options = {
      models: { test: 'model-test' },
      plugins: { test: ['plugin1', 'plugin2'] }
    };

    testModel = {
      setupModel: sinon.stub(),
      baseSchema: sinon.stub().returns({ foo: String })
    };

    plugin1 = sinon.stub();
    plugin2 = sinon.stub();

    imports = { mongoose, plugin1, plugin2, 'model-test': testModel };

  });

  it('should be able to setup a model', function () {
    const model = service(options, imports);

    model('test');

    assert.called(plugin1);
    assert.called(plugin2);
    assert.called(testModel.baseSchema);
    assert.calledWith(testModel.setupModel, 'test');

    assert.calledWith(mongoose.model, 'test');
  });

  it('should throw an error if cannot find model', function () {
    options = {
      models: { test: 'non-existent model' }
    };

    assert.throws(() => service(options, imports), /cannot find the model/i);
  });

  it('should throw an error if cannot find plugin', function () {
    options = {
      plugins: { test: ['non-existent addon'] }
    };

    assert.throws(() => service(options, imports), /cannot find the plugin/i);
  });

});
