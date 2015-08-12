'use strict';

import StaticTeam from '../modules/team/static';

export default function (options, imports) {

  const service = new StaticTeam(options.members);

  return Promise.resolve({ service });

}
