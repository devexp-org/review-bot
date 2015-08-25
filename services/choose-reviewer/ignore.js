'use strict';

import { reject, isEmpty, contains } from 'lodash';

export default function ignore(options = {}) {
  const list = options.list || [];

  return function ignoreStep(review, payload) {
    if (isEmpty(review.team) || isEmpty(list)) {
      return Promise.resolve(review);
    }

    review.team = reject(review.team, member => contains(list, member.login));

    return Promise.resolve(review);
  };
}
