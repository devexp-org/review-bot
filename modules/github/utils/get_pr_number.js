var _ = require('lodash');

module.exports = function (pullRequestUrl) {
    return parseInt(_.last(pullRequestUrl.split('/')));
};
