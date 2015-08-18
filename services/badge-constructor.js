'use strict';

import Badgs from 'badgs';

export default function (options, imports) {

  const service = new Badgs(options.template);

  return Promise.resolve({ service });

}
