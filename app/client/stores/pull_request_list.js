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

    onPullRequestsLoaded(pullRequests) {
        this.setState({ pullRequests });
    }
}

export default alt.createStore(PullRequestListStore, 'PullRequestListStore');
