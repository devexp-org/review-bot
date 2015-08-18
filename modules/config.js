'use strict';

import fs from 'fs';
import path from 'path';
import { merge } from 'lodash';

export default function config(basePath, envName) {

  envName = envName || process.env.NODE_ENV || 'development';

  const join = path.join.bind(path, basePath, 'config');
  const requireIfExists = function (configPath) {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath));
    }
    return {};
  };

  const defaultConfigPath = join('default.json');
  const secretConfigPath = join('secret.json');
  const envConfigPath = join(envName + '.json');

  const defaultConfig = requireIfExists(defaultConfigPath);
  const secretConfig = requireIfExists(secretConfigPath);
  const envConfig = requireIfExists(envConfigPath);

  return merge({ env: envName }, defaultConfig, secretConfig, envConfig);

}
