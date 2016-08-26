import { forEach } from 'lodash';

/**
 * Plugin broker helps to extend models
 */
export default class PluginBroker {

  /**
   * @param {Object[]} plugins
   */
  constructor(plugins) {
    this.plugins = plugins || {};
  }

  /**
   * Returns plugins.
   *
   * @param {String} model - model name.
   *
   * @return {Object}
   */
  get(model) {
    return this.plugins[model] || [];
  }

  /**
   * Adds plugins to model.
   *
   * @param {String} name - model name.
   * @param {Object} model - mongoose model.
   */
  setupModel(name, model) {
    forEach(this.get(name), (plugin) => {
      model.plugin(plugin);
    });
  }

}
