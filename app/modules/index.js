import domain from 'app/modules/utils/domain';
import config from 'app/modules/config';

// Import modules
import mongoose from 'app/modules/mongoose';
import githubApi from 'app/modules/github/api';
import modelsAddons from 'app/modules/models/addons';
import team from 'app/modules/team';
import badges from 'app/modules/badges';
import ranking from 'app/modules/review/ranking';

import reivewBadges from 'app/modules/review_badges';
import reviewAutoassign from 'app/modules/review_autoassign';
import reviewCommands from 'app/modules/commands';

domain('Modules', function () {
    mongoose.init(config.load('mongoose'));
    githubApi.init(config.load('github'));
    modelsAddons.init(config.load('models'));
    team.init(config.load('team'));
    badges.init(config.load('badges'));
    ranking.init(config.load('review'));

    reviewAutoassign();
    reivewBadges();
    reviewCommands(config.load('commands'));
});
