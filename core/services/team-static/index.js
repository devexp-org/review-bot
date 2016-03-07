'use strict';

import StaticTeam from './static';

export default function (options, imports) {

  const service = new StaticTeam(options.members);

  return service;

}
