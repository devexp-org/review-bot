import alt from 'app/client/alt';

import PullRequestsActions from 'app/client/actions/pull_requests';

import splitByRepo from 'app/client/utils/split_by_repo';

class PullRequestListStore {
    constructor() {
        this.bindListeners({
            onPullRequestsLoaded: PullRequestsActions.userPullsLoaded
        });
    }

    onPullRequestsLoaded(pullRequests) {
        pullRequests = splitByRepo(pullRequests);

        this.setState({ pullRequests });
    }
}

export default alt.createStore(PullRequestListStore, 'PullRequestListStore');
