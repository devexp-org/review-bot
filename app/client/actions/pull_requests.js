import alt from 'app/client/alt';

class PullRequestsActions {
    constructor() {
        this.generateActions('userPullsLoaded', 'pullLoaded', 'failed');
    }

    /**
     * Loads user pull requests by username
     *
     * @param {String} username
     */
    loadUserPulls(username) {
        fetch('/api/github/pulls/' + username)
            .then(res => res.json())
            .then(
                (res) => this.actions.userPullsLoaded(res.data),
                (err) => {
                    console.error(err);

                    this.actions.failed(err);
                }
            );
    }

    /**
     * Load single pull request by id
     *
     * @param {Number} id
     */
    loadPull(id) {
        fetch('/api/github/pull/' + id)
            .then(res => res.json())
            .then(
                (res) => this.actions.pullLoaded(res.data),
                (err) => {
                    console.error(err);

                    this.actions.failed(err);
                }
            );
    }
}

export default alt.createActions(PullRequestsActions);
