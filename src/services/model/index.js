import { Schema } from 'mongoose';
import { forEach } from 'lodash';

import AddonBroker from './class';
import * as UserModel from './user/';
import * as PullRequestModel from './pull-request/';

export default function setup(options, imports) {

  const mixins = {};
  const extenders = {};

  const mongoose = imports.mongoose;

  forEach(options.addons, (list, modelName) => {

    forEach(list, (addonName) => {
      const addon = imports[addonName];

      if (!addon) {
        throw new Error(`Cannot find the addon "${addonName}"`);
      }

      if (!mixins[modelName]) {
        mixins[modelName] = [];
        extenders[modelName] = [];
      }

      addon.mixin && mixins[modelName].push(addon.mixin);
      addon.extender && extenders[modelName].push(addon.extender);
    });

  });

  const broker = new AddonBroker(mixins, extenders);

  const setup = function setup(modelName, module) {
    // setup schema
    const base = module.setupSchema();
    const schema = broker.setupSchema(modelName, base);

    const mongooseModel = new Schema(schema);

    // setup methods
    module.setupModel(modelName, mongooseModel);
    broker.setupModel(modelName, mongooseModel);

    // register model
    mongoose.model(modelName, mongooseModel);
  };

  setup('user', UserModel);
  setup('pull_request', PullRequestModel);

  return (modelName) => mongoose.model(modelName);

}
