import * as config from 'app/core/config';

/**
 * Review
 */
require('app/plugins/review_autoassign')();
require('app/plugins/review_commands/dispatcher')(config.load('review_commands'));
