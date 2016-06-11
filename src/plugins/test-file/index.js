import { forEach } from 'lodash';

import TestFileResolver from './class';

export default function setup(options, imports) {

  const service = {};

  forEach(options.patterns, (pattern, name) => {
    const Resolver = options.resolvers[name]
      ? imports.requireDefault(options.resolvers[name])
      : TestFileResolver;

    service[name] = new Resolver(pattern);
  });

  return service;

}
