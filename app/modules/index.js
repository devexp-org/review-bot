import domain from 'app/modules/utils/domain';
import config from 'config';

domain('Modules', function () {
    require('app/modules/jabber').init(config.get('jabber'));
    require('app/modules/mongoose').init(config.get('mongoose'));
    require('app/modules/models/addons').init(config.get('models'));
    require('app/modules/github/api').init(config.get('github'));
    require('app/modules/team').init(config.get('team'));
    require('app/modules/badges').init(config.get('badges'));
    require('app/modules/review/ranking').init(config.get('review'));

    require('app/modules/review_badges')();
    require('app/modules/review_autoassign')();
    require('app/modules/commands')(config.get('commands'));
    require('app/modules/notifications')(config.get('notifications'));
});
