import { merge, withApp, withInitial } from '../app';
import { withTeamModel } from '../model/model-team';
import { withUserModel } from '../model/model-user';
import { withPullRequestModel } from '../model/model-pull-request';

import testingConfig from '../../../config/testing';

export function withModel(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        model: {
          path: './src/services/model',
          dependencies: ['mongoose']
        },
        mongoose: {
          path: './src/services/mongoose',
          options: {
            host: testingConfig.services.mongoose.options.host
          },
          dependencies: ['logger']
        }
      }
    }, config);

    next(test, config, done);

  };

}

export function withModelSuite(next) {
  return withUserModel(withTeamModel(withPullRequestModel(withModel(next))));
}

export function withFooModel(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        model: {
          options: {
            models: {
              foo: 'model-foo'
            }
          },
          dependencies: ['model-foo']
        },
        'model-foo': {
          module: function () {
            return {
              baseSchema: function () {
                return { _id: String, property: String };
              },
              setupModel: function () {}
            };
          }
        }
      }
    }, config);

    next(imports => {

      let foo;
      const FooModel = imports.model('foo');

      return FooModel
        .remove({})
        .then(() => {
          foo = new FooModel();
          foo.set({ _id: 'foo', property: 'foo' });
          return foo.save();
        })
        .then(() => {
          imports.foo = foo;
          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/model', function () {

  const test = withFooModel(withModel(withInitial(withApp)));

  it('should be able to apply plugins', function (done) {

    const plugin = function () {
      return function (schema) {
        schema.add({ newProperty: { type: Number, 'default': 0 } });

        schema.pre('save', function (next) {
          this.newProperty = 1;
          next();
        });
      };
    };

    const config = {
      services: {
        model: {
          options: {
            plugins: { foo: ['foo-plugin'] }
          },
          dependencies: [
            'foo-plugin'
          ]
        },
        'foo-plugin': { module: plugin }
      }
    };

    test(imports => {
      const foo = imports.foo;
      assert.equal(foo.newProperty, 1);
    }, config, done);

  });

});
