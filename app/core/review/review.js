import ranking from './ranking';
import { PullRequest } from 'app/core/models';

export default function review(pullRequestId) {
    var reviewQueue = PullRequest
        .findById(pullRequestId)
        .exec()
        .then((pullRequest) => {
            if (!pullRequest) {
                throw new Error(`Pull Request with id = ${pullRequestId} not found!`);
            }

            return { pull: pullRequest, team: [] };
        });

    ranking.get().forEach((reducer) => {
        reviewQueue.then(reducer);
    });

    return reviewQueue;
}
