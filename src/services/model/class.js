import { cloneDeep, forEach, merge } from 'lodash';

/**
 * Addon broker helps to extend base model schema and to add new methods.
 */
export default class AddonBroker {

  /**
   * @param {Object[]} mixins - each mixin add methods to model
   * @param {Object[]} extenders - each extender return parial schema
   */
  constructor(mixins, extenders) {
    this.mixins = mixins || {};
    this.extenders = extenders || {};
  }

  /**
   * Return mixins and extenders for given model
   *
   * @param {String} model - model name.
   *
   * @return {Object}
   */
  get(model) {
    return {
      mixins: this.mixins[model] || [],
      extenders: this.extenders[model] || []
    };
  }

  /**
   * Add mixins to model
   *
   * @param {String} name - model name.
   * @param {Object} model - mongoose model.
   */
  setupModel(name, model) {
    forEach(this.get(name).mixins, (mixin) => {
      mixin(model, name);
    });
  }

  /**
   * Setup model extenders.
   *
   * @param {String} name - model name
   * @param {Object} schema - base schema
   *
   * @return {Object} extended schema
   */
  setupSchema(name, schema) {
    let newSchema = cloneDeep(schema);

    forEach(this.get(name).extenders, (extender) => {
      newSchema = merge(newSchema, extender(schema));
    });

    return newSchema;
  }

}
