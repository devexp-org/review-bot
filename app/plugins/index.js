var config = require('app/core/config');

/**
 * Review
 */
require('app/plugins/review_autoassign')();
require('app/plugins/review_badges')();
require('app/plugins/commands')(config.load('commands'));
