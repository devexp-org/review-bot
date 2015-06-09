module.exports = function (github) {
    var PullRequest = github.models.PullRequest;

    return function processPullRequest(body) {
        PullRequest
            .findByPrId(body.pull_request.id)
            .exec()
            .then(function (pullRequest) {
                if (!pullRequest)
                    pullRequest = new PullRequest(body.pull_request);

                return pullRequest.save();
            })
            .then(function (pullRequest) {
                console.log('saved: ', pullRequest);

                github.emit('pull_request', { pullRequest: pullRequest });
            }, console.error.bind(console));
    };
};
