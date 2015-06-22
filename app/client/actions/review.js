import alt from 'app/client/alt';

class ReviewActions {
    constructor() {
        this.generateActions('reviewersChosen', 'failed');
    }

    /**
     * Choose reviewers by pull request id
     *
     * @param {Number} pullId
     */
    chooseReviewers(pullId) {
        setTimeout(() => {
            fetch('/api/review/reviewers/choose/' + pullId)
                .then(res => res.json())
                .then(
                    (res) => this.actions.reviewersChosen(res.data.team),
                    (err) => {
                        console.error(err);

                        this.actions.failed(err);
                    }
                );
        }, 100);

        this.dispatch();
    }
}

export default alt.createActions(ReviewActions);
