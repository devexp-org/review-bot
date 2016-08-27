import { merge, withApp } from '../app';

export const MONGODB_HOST = 'mongodb://localhost/devexp_test';

export function withModel(test, config, done) {

  config = merge({
    services: {
      logger: {
        path: './src/services/logger',
        options: { handlers: {} }
      },
      mongoose: {
        path: './src/services/mongoose',
        options: { host: MONGODB_HOST },
        dependencies: ['logger']
      },
      model: {
        path: './src/services/model',
        dependencies: ['mongoose']
      }
    }
  }, config);

  withApp(test, config, done);

}

export function withFooCollection(test, config, done) {

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

  withModel(imports => {

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

}

describe('services/model', function () {

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

    withFooCollection(imports => {
      const foo = imports.foo;
      assert.equal(foo.newProperty, 1);
    }, config, done);

  });

});
