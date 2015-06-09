module.exports = function (github) {
    var PullRequest = github.models.PullRequest;

    return function processPullRequest(body) {
        return PullRequest
            .findByPrId(body.pull_request.id)
            .exec()
            .then(function (pullRequest) {
                if (!pullRequest) {
                    pullRequest = new PullRequest(body.pull_request);
                } else {
                    pullRequest.set(body.pull_request);
                }

                return pullRequest.save();
            })
            .then(function (pullRequest) {
                github.emit('pull_request', { pullRequest: pullRequest });

                return pullRequest;
            }, console.error.bind(console));
    };
};
