'use strict';

import StaticTeam from '../modules/team/static';

export default function (options, imports) {

  return new StaticTeam(options.members);

}
