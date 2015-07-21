var domain = require('app/modules/utils/domain');
var config = require('app/modules/config');

/**
 * Review
 */
domain('Modules', function () {
    require('app/modules/mongoose').init(config.load('mongoose'));
    require('app/modules/models/addons').init(config.load('models'));
    require('app/modules/github/api').init(config.load('github'));
    require('app/modules/team').init(config.load('team'));
    require('app/modules/review/ranking').init(config.load('review'));
    require('app/modules/badges').init(config.load('badges'));

    require('app/modules/review_autoassign')();
    require('app/modules/review_badges')();
    require('app/modules/commands')(config.load('commands'));
});
