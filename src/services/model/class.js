import { forEach } from 'lodash';

/**
 * Plugin broker helps to extend models.
 */
export default class PluginBroker {

  /**
   * @constructor
   * @property {Object[]} plugins
   *
   * @param {Object[]} plugins
   *
   */
  constructor(plugins) {
    this.plugins = plugins || {};
  }

  /**
   * Returns plugins for the given model.
   *
   * @param {String} model Model name.
   *
   * @return {Object}
   */
  get(model) {
    return this.plugins[model] || [];
  }

  /**
   * Applies plugins to the given model.
   *
   * @param {String} name Model name.
   * @param {Object} model Mongoose model.
   */
  setupModel(name, model) {
    forEach(this.get(name), (plugin) => {
      model.plugin(plugin, name);
    });
  }

}
