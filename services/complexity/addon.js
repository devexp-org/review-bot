'use strict';

import * as complexity from '../../modules/complexity';

const MAX = 40;

/**
 * Extend pull_request model to add complexity rate.
 *
 * @return {Object}
 */
export function extender() {

  return {
    complexity: {
      type: Number,
      'default': 0
    }
  };

}

/**
 * Pre save hook for pull_request model which calculates pull request complexity.
 *
 * @param {Object} model - pull request object
 *
 * @return {Promise}
 */
export function saveHook(model) {

  return new Promise(resolve => {
    let value = 0;

    value += complexity.additionsComplexity(model.additions);
    value += complexity.deletionsComplexity(model.deletions);
    value += complexity.commitsComplexity(model.commits);

    model.complexity = (value * 100) / MAX;

    resolve();
  });

}
