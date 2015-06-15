import alt from 'app/client/alt';

class PullRequestsActions {
    constructor() {
        this.generateActions('loaded', 'failed');
    }

    load(username) {
        fetch('/api/github/pull-requests/' + username)
            .then(res => res.json())
            .then(
                res => this.actions.loaded(res.data),
                err => {
                    console.error(err);

                    this.actions.failed(err);
                }
            );
    }
}

export default alt.createActions(PullRequestsActions);
