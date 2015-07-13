var domain = require('app/core/utils/domain');
var config = require('app/core/config');

/**
 * Review
 */
domain('Plugins', function () {
    require('app/plugins/review_autoassign')();
    require('app/plugins/review_badges')();
    require('app/plugins/commands')(config.load('commands'));
});
