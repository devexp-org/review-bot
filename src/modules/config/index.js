import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * Returns a parsed json file if the config file exists,
 * otherwise return an empty object.
 *
 * @param {String} configPath
 *
 * @return {Object}
 */
export function requireIfExists(configPath) {
  if (fs.existsSync(configPath)) {
    let config;

    try {
      config = JSON.parse(fs.readFileSync(configPath));
    } catch (e) {
      throw new Error(`Cannot parse file "${configPath}":\n` + e.message);
    }

    return config;
  }

  return {};
}

export default function config(basePath, envName, middlewares = []) {

  envName = envName || process.env.NODE_ENV || 'development';
  basePath = path.join(basePath, 'config');

  const join = path.join.bind(path, basePath);
  const transform = (json) => {
    return middlewares.reduce((acc, func) => func(acc), json);
  };

  const defaultConfigPath = join('default.json');
  const defaultConfigRaw = requireIfExists(defaultConfigPath);
  const defaultConfig = transform(defaultConfigRaw);

  const secretConfigPath = join('secret.json');
  const secretConfigRaw = requireIfExists(secretConfigPath);
  const secretConfig = transform(secretConfigRaw);

  const envConfigPath = join(envName + '.json');
  const envConfigRaw = requireIfExists(envConfigPath);
  const envConfig = transform(envConfigRaw);

  return _.merge({ env: envName }, defaultConfig, secretConfig, envConfig);

}
