import { Schema } from 'mongoose';
import { forEach } from 'lodash';

import PluginBroker from './class';

/**
 * Create "model" service.
 *
 * @param {Object} options
 * @param {Array} options.models List of models to register.
 * @param {Array} options.plugins List of plugins for models.
 * @param {Object} imports
 * @param {MongooseConnection} imports.mongoose
 *
 * @return {Model}
 */
export default function setup(options, imports) {

  const plugins = {};
  const mongoose = imports.mongoose;

  forEach(options.plugins, (list, modelName) => {

    forEach(list, (pluginName) => {
      const plugin = imports[pluginName];

      if (!plugin) {
        throw new Error(`Cannot find the plugin module "${pluginName}"`);
      }

      if (!plugins[modelName]) {
        plugins[modelName] = [];
      }

      plugins[modelName].push(plugin);
    });

  });

  const broker = new PluginBroker(plugins);

  const setup = function setup(modelName, module) {
    const schema = module.baseSchema();
    const mongooseModel = new Schema(schema);

    module.setupModel(modelName, mongooseModel);
    broker.setupModel(modelName, mongooseModel);

    mongoose.model(modelName, mongooseModel);
  };

  forEach(options.models, (moduleName, modelName) => {
    const module = imports[moduleName];

    if (!module) {
      throw new Error(`Cannot find the model module "${moduleName}"`);
    }

    setup(modelName, module);
  });

  return (modelName) => mongoose.model(modelName);

}

/**
 * Function used to get mongoose models.
 *
 * @callback Model
 *
 * @param {String} name Model name.
 *
 * @return {MongooseModel}
 */

/**
 * @classdesc The class used to represent the Mongoose model.
 *
 * @name MongooseModel
 * @class
 */
