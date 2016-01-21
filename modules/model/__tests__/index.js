'use strict';

import { ModelAddonBroker } from '../../model';

describe('modules/model', function () {

  describe('ModelAddonBroker', function () {

    it('should be able to extend base schema', function () {
      const baseSchema = {
        moduleA: {
          fieldA: Number
        }
      };

      const extender = function () {
        return {
          moduleA: {
            fieldB: String
          }
        };
      };

      const addonBroker = new ModelAddonBroker(null, { modelA: [extender] });

      const newSchema = addonBroker.setupExtenders('modelA', baseSchema);

      assert.deepEqual(newSchema, { moduleA: { fieldA: Number, fieldB: String } });
    });

    it('should be able to add pre-save hook', function (done) {
      const modelStub = {
        pre: function (hookName, callback) {
          assert.equal(hookName, 'save');
          this.preCallback = callback;
        }
      };

      const objectStub = {
        fieldA: 1,

        save: function () {
          const next = function () {
            assert.equal(objectStub.fieldA, 2);
            done();
          };

          modelStub.preCallback.call(this, next);
        }
      };

      const saveHook = function (model) {
        return new Promise(resolve => {
          model.fieldA += 1;

          resolve();
        });
      };

      const addonBroker = new ModelAddonBroker({ modelA: [saveHook] }, null);

      addonBroker.setupSaveHooks('modelA', modelStub);

      objectStub.save();
    });

  });

});
