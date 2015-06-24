import alt from 'app/client/alt';

class ReviewActions {
    constructor() {
        this.generateActions(
            'reviewersChosen',
            'removeReviewer',
            'assignReviewer',
            'cancel',
            'failed'
        );
    }

    /**
     * Choose reviewers by pull request id
     *
     * @param {Number} pullId
     */
    chooseReviewers(pullId) {
        this.dispatch();

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
        }, 300);
    }

    save(review) {
        this.dispatch();

        fetch('/api/review/', {
            method: 'post',
            body: review
        });
    }
}

export default alt.createActions(ReviewActions);
