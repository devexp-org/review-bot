import domain from 'app/modules/utils/domain';
import config from 'app/modules/config';

domain('Modules', function () {
    require('app/modules/jabber').init(config.load('jabber'));
    require('app/modules/mongoose').init(config.load('mongoose'));
    require('app/modules/models/addons').init(config.load('models'));
    require('app/modules/github/api').init(config.load('github'));
    require('app/modules/team').init(config.load('team'));
    require('app/modules/badges').init(config.load('badges'));
    require('app/modules/review/ranking').init(config.load('review'));

    require('app/modules/review_badges')();
    require('app/modules/review_autoassign')();
    require('app/modules/commands')(config.load('commands'));
    require('app/modules/notifications')(config.load('notifications'));
});
