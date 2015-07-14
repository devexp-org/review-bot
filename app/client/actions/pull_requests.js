import alt from 'app/client/alt';

class PullRequestsActions {
    constructor() {
        this.generateActions(
            'userPullsLoaded',
            'pullLoaded',
            'userPullsLoadingFailed',
            'pullLoadingFailed'
        );
    }

    /**
     * Loads user pull requests by username
     *
     * @param {String} username
     */
    loadUserPulls(username) {
        this.dispatch();

        fetch('/api/github/pulls/' + username)
            .then(res => res.json())
            .then(res => this.actions.userPullsLoaded(res.data))
            .catch(err => this.actions.userPullsLoadingFailed(err));
    }

    /**
     * Load single pull request by id
     *
     * @param {Number} id
     */
    loadPull(id) {
        this.dispatch();

        fetch('/api/github/pull/' + id)
            .then(res => res.json())
            .then(res => this.actions.pullLoaded(res.data))
            .catch(err => this.actions.pullLoadingFailed(err));
    }
}

export default alt.createActions(PullRequestsActions);
