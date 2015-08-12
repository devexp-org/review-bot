'use strict';

import BadgeConstructor from '../modules/badge-constructor';

export default function (options, imports) {

  const service = new BadgeConstructor(options);

  return Promise.resolve({ service });

}
