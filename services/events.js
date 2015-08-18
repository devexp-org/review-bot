'use strict';

import { EventEmitter } from 'events';

export default function () {

  const service = new EventEmitter();

  return Promise.resolve({ service });

}
