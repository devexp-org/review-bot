import service from '../../model';

describe('services/model', function () {

  let options, imports;

  beforeEach(function () {

    options = {
      addons: {
        pull_request: [
          {
            saveHook: function (model) {
              model.test = 42;

              return Promise.resolve(model);
            },

            extender: function () {
              return {
                test: {
                  type: Number,
                  'default': 0
                }
              };
            }
          },
          {
            extender: function () {
              return {
                magic: String
              };
            }
          }
        ]
      }
    };

    imports = {
      require: function (module) {
        return module;
      },
      mongoose: {
        model: sinon.stub()
      }
    };

  });

  it('should setup pull_request model', function (done) {

    const model = service(options, imports);
    model.get('pull_request');
    done();

  });

});
