'use strict';

import _ from 'lodash';
import { Schema } from 'mongoose';

import { AddonBroker } from '../modules/model';
import * as pullRequest from '../modules/model/pull_request';

export default function (options, imports) {

  const mongoose = imports.mongoose;

  const saveHooks = {};
  const extenders = {};

  _.forEach(options.addons, (list, modelName) => {
    _.forEach(list, addon => {
      const m = require(addon);

      if (!saveHooks[modelName]) {
        saveHooks[modelName] = [];
        extenders[modelName] = [];
      }

      m.saveHook && saveHooks[modelName].push(m.saveHook);
      m.extender && extenders[modelName].push(m.extender);
    });
  });

  const addonBroker = new AddonBroker(saveHooks, extenders);

  const setup = function setup(modelName, module) {
    const schema = module.setupSchema();

    addonBroker.setupExtenders(modelName, schema);

    const model = new Schema(schema);

    module.setupModel(modelName, model);

    addonBroker.setupSaveHooks(modelName, model);

    mongoose.model(modelName, model);
  };

  setup('pull_request', pullRequest);

  const service = {
    get(modelName) {
      return mongoose.model(modelName);
    }
  };

  return Promise.resolve({ service });

}
