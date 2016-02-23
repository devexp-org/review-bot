import alt from 'client/alt';

import PullRequestsActions from 'client/actions/pull_requests';

import splitByRepo from 'client/utils/split_by_repo';

class PullRequestListStore {
    constructor() {
        this.bindListeners({
            onLoadUserPulls: PullRequestsActions.loadUserPulls,
            onPullRequestsLoaded: PullRequestsActions.userPullsLoaded,
            onFailed: PullRequestsActions.userPullsLoadingFailed
        });
    }

    onLoadUserPulls() {
        this.setState({ loading: true, notFound: false });
    }

    onPullRequestsLoaded(pullRequests) {
        pullRequests = splitByRepo(pullRequests);

        this.setState({ pullRequests, loading: false });
    }

    onFailed() {
        this.setState({ pullRequests: {}, loading: false, notFound: true });
    }
}

export default alt.createStore(PullRequestListStore, 'PullRequestListStore');
