import alt from 'app/client/alt';
import PullRequestsActions from 'app/client/actions/pull_requests';

class PullRequestStore {
    constructor() {
        this.bindListeners({
            onPullRequestLoaded: PullRequestsActions.pullLoaded
        });
    }

    onPullRequestLoaded(pullRequest) {
        this.setState({ pullRequest });
    }
}

export default alt.createStore(PullRequestStore, 'PullRequestStore');
