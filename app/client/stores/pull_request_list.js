import alt from 'app/client/alt';
import PullRequestsActions from 'app/client/actions/pull_requests';

class PullRequestListStore {
    constructor() {
        this.state = {
            pullRequests: []
        };

        this.bindListeners({
            onPullRequestsLoaded: PullRequestsActions.loaded
        });
    }

    splitByRepo(pullRequests) {
        var listByRepo = {},
            result = [];

        pullRequests.forEach((pr) => {
            var fullName = pr.head.repo.full_name;

            listByRepo[fullName] = listByRepo[fullName] || [];
            listByRepo[fullName].push(pr);
        });

        Object.keys(listByRepo).forEach((key) => {
            result.push(key);

            result = result.concat(listByRepo[key]);
        });

        return result;
    }

    onPullRequestsLoaded(pullRequests) {
        pullRequests = this.splitByRepo(pullRequests);

        this.setState({ pullRequests });
    }
}

export default alt.createStore(PullRequestListStore, 'PullRequestListStore');
