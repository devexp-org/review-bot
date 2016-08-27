import { Schema } from 'mongoose';
import { forEach } from 'lodash';

import PluginBroker from './class';

export default function setup(options, imports) {

  const plugins = {};
  const mongoose = imports.mongoose;

  const setup = function setup(modelName, module) {
    const schema = module.baseSchema();
    const mongooseModel = new Schema(schema);

    module.setupModel(modelName, mongooseModel);
    broker.setupModel(modelName, mongooseModel);

    mongoose.model(modelName, mongooseModel);
  };

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

  forEach(options.models, (moduleName, modelName) => {
    const module = imports[moduleName];

    if (!module) {
      throw new Error(`Cannot find the model module "${moduleName}"`);
    }

    setup(modelName, module);
  });

  return (modelName) => mongoose.model(modelName);

}
