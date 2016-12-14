import { forEach } from 'lodash';

export function findPlugins(config) {
  const plugins = [];

  forEach(config.services, (service, serviceName) => {
    forEach(Object.keys(service), (key) => {
      if (key.substr(0, 8) === '#plugin:') {
        plugins.push({
          service: key.substr(8),
          options: service[key],
          dependency: serviceName
        });
      }
    });
  });

  return plugins;
}

export default function setup(options, imports) {
  const app = imports.__app__;
  const plugins = findPlugins(app.getConfig());

  forEach(plugins, (plugin) => {
    app.addOptions(plugin.service, plugin.options);
    app.addDependency(plugin.service, plugin.dependency);
  });
}
