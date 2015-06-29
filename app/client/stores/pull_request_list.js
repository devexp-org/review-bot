import alt from 'app/client/alt';

import PullRequestsActions from 'app/client/actions/pull_requests';

import splitByRepo from 'app/client/utils/split_by_repo';

class PullRequestListStore {
    constructor() {
        this.bindListeners({
            onLoadUserPulls: PullRequestsActions.loadUserPulls,
            onPullRequestsLoaded: PullRequestsActions.userPullsLoaded,
            onFailed: PullRequestsActions.userPullsLoadingFailed
        });
    }

    onLoadUserPulls() {
        this.setState({ loading: true });
    }

    onPullRequestsLoaded(pullRequests) {
        pullRequests = splitByRepo(pullRequests);

        this.setState({ pullRequests, loading: false });
    }

    onFailed() {
        this.setState({ pullRequests: {}, loading: false });
    }
}

export default alt.createStore(PullRequestListStore, 'PullRequestListStore');
