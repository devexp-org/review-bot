import service from '../';

describe('services/model', function () {

  let options, imports, mongoose;

  beforeEach(function () {

    mongoose = { model: sinon.stub() };

    options = {
      addons: { user: ['addon1', 'addon2'] }
    };

    const addon1 = {
      extender: function () {
        return {
          test: {
            type: Number,
            'default': 0
          }
        };
      }
    };

    const addon2 = {
      mixin: function () {},

      extender: function () {
        return {
          magic: String
        };
      }
    };

    imports = { mongoose, addon1, addon2 };

  });

  it('should setup model', function () {
    const model = service(options, imports);
    mongoose.model.reset();
    // mongoose.model.withArgs('user').returns('user');

    model('user');
    assert.calledWith(mongoose.model, 'user');
  });

  it('should throw an error if cannot find addon', function () {
    options = {
      addons: { user: ['non-existent addon'] }
    };

    assert.throws(() => service(options, imports), /cannot find/i);
  });

});
