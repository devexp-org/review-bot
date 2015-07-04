const MAX = 40;

/**
 * Maps amount of addtioions to complexity rate.
 * Max: 20
 *
 * @param {Number} additions
 *
 * @returns {Number}
 */
function additionsComplexity(additions) {
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
 * Maps amount of deletions to complexity rate.
 * Max: 10
 *
 * @param {Number} deletions
 *
 * @returns {Number}
 */
function deletionsComplexity(deletions) {
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
 * Maps amount of commits to complexity rate.
 * Max: 10
 *
 * @param {Number} commits
 *
 * @returns {Number}
 */
function commitsComplexity(commits) {
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

/**
 * Extender for PullRequest model which adds complexity rate.
 *
 * @returns {Object}
 */
export function extender() {
    return {
        complexity: { type: Number, 'default': 0 }
    };
}

/**
 * Pre save hook for PullRequest model which calculates pull request complexity.
 *
 * @returns {Function}
 */
export function hook() {
    return function (model) {
        return new Promise((resolve) => {
            var complexity = 0;

            complexity += additionsComplexity(model.additions);
            complexity += deletionsComplexity(model.deletions);
            complexity += commitsComplexity(model.commits);

            model.complexity = (complexity * 100) / MAX;

            resolve();
        });
    };
}
