module.exports = function (github) {
    return function processPullRequest(body) {
        github.models.PullRequest.findByPrId(body.pull_request.id, function (err, pullRequest) {
            if (pullRequest) {
                console.log(pullRequest);
                console.log('found');
            } else {
                pullRequest = new github.models.PullRequest(body.pull_request);

                pullRequest.save(function (err, doc) {
                    if (err) console.error(err);

                    console.log('saved: ', doc);
                });
            }
        });
    };
};
