'use strict';

import _ from 'lodash';

export class AddonBroker {

  /**
   * @constructor
   *
   * @param {Object} saveHooks
   * @param {Object} extenders
   */
  constructor(saveHooks, extenders) {
    this.saveHooks = saveHooks || {};
    this.extenders = extenders || {};
  }

  /**
   * Return pre save hooks and extenders for given model
   *
   * @param {String} model - model name.
   *
   * @return {Object}
   */
  get(model) {
    return {
      saveHooks: this.saveHooks[model] || [],
      extenders: this.extenders[model] || []
    };
  }

  /**
   * Setup model pre save hooks.
   *
   * @param {String} name - model name.
   * @param {Object} model - mongoose model.
   */
  setupSaveHooks(name, model) {
    const saveHooks = this.get(name).saveHooks;

    model.pre('save', function (next) {
      const promise = [];

      _.forEach(saveHooks, hook => {
        promise.push(hook(this));
      });

      Promise.all(promise).then(next);
    });
  }

  /**
   * Setup model extenders.
   *
   * @param {String} name - model name.
   * @param {Object} schema - model base schema.
   */
  setupExtenders(name, schema) {
    const extenders = this.get(name).extenders;

    _.forEach(extenders, extender => {
      _.merge(schema, extender(schema));
    });
  }

}
