var mongoose = require('mongoose');

module.exports = {
    PullRequest: mongoose.model('PullRequest', require('./pull_request'))
};
