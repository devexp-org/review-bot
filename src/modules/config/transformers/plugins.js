import { isArray, forEach, mergeWith } from 'lodash';

export function merge(object, sources) {
  return mergeWith(object, sources, function (objValue, srcValue) {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}

export default function transformer() {

  return function plugins(json) {

    forEach(json.services, (service, serviceName) => {

      if (service.ignore) return;

      forEach(Object.keys(service), (key) => {

        if (key.substr(0, 8) === '#plugin:') {

          const name = key.substr(8);
          const parent = json.services[name];

          if (!parent) return;

          if (!parent.options) {
            parent.options = {};
          }

          if (!parent.dependencies) {
            parent.dependencies = [];
          }

          parent.options = merge(parent.options, service[key]);

          if (isArray(parent.dependencies)) {
            parent.dependencies.push(serviceName);
          } else {
            parent.dependencies[serviceName] = serviceName;
          }
        }

      });

    });

    return json;

  };

}
