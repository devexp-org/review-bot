'use strict';

/**
 * Map amount of addtioions to complexity rate.
 *
 * @param {Number} additions
 *
 * @return {Number}
 */
export function additionsComplexity(additions) {
  if (additions === 0) {
    return 0;
  }

  if (additions < 100) {
    return 2;
  }

  if (additions >= 100 && additions < 200) {
    return 6;
  }

  if (additions >= 200 && additions < 300) {
    return 10;
  }

  if (additions >= 300 && additions < 600) {
    return 14;
  }

  return 20;
}

/**
 * Map amount of deletions to complexity rate.
 *
 * @param {Number} deletions
 *
 * @return {Number}
 */
export function deletionsComplexity(deletions) {
  if (deletions === 0) {
    return 0;
  }

  if (deletions < 100) {
    return 1;
  }

  if (deletions >= 100 && deletions < 200) {
    return 3;
  }

  if (deletions >= 200 && deletions < 300) {
    return 5;
  }

  if (deletions >= 300 && deletions < 600) {
    return 7;
  }

  return 10;
}

/**
 * Map amount of commits to complexity rate.
 *
 * @param {Number} commits
 *
 * @return {Number}
 */
export function commitsComplexity(commits) {
  if (commits === 0) {
    return 0;
  }

  if (commits < 3) {
    return 3;
  }

  if (commits >= 3 && commits < 5) {
    return 6;
  }

  if (commits >= 5 && commits < 7) {
    return 8;
  }

  return 10;
}
