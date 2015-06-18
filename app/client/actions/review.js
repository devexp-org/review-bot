import alt from 'app/client/alt';

class ReviewActions {
    constructor() {
        this.generateActions('reviewersChoosen', 'failed');
    }

    /**
     * Choose reviewers by pull request id
     *
     * @param {Number} pullId
     */
    chooseReviewers(pullId) {
        fetch('/api/review/reviewers/choose/' + pullId)
            .then(res => res.json())
            .then(
                (res) => this.actions.reviewersChoosen(res.data.team),
                (err) => {
                    console.error(err);

                    this.actions.failed(err);
                }
            );
    }
}

export default alt.createActions(ReviewActions);
