import alt from 'app/client/alt';

class ReviewActions {
    constructor() {
        this.generateActions(
            'userReviewsLoaded',
            'reviewersChosen',
            'removeReviewer',
            'assignReviewer',
            'cancel',
            'choosingReviewersFailed',
            'loadingReviewsFailed'
        );
    }

    loadUserReviews(login) {
        this.dispatch();

        fetch('/api/review/reviews/' + login)
            .then(res => res.json())
            .then(
                (res) => this.actions.userReviewsLoaded(res.data),
                (err) => {
                    console.error(err);

                    this.actions.loadingReviewsFailed(err);
                }
            );
    }

    /**
     * Choose reviewers by pull request id
     *
     * @param {Number} pullId
     */
    chooseReviewers(pullId) {
        this.dispatch();

        fetch('/api/review/reviewers/choose/' + pullId)
            .then(res => res.json())
            .then(
                (res) => this.actions.reviewersChosen(res.data.team),
                (err) => {
                    console.error(err);

                    this.actions.choosingReviewersFailed(err);
                }
            );
    }

    save(review) {
        this.dispatch();

        fetch('/api/review/save', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        });
    }

    approve({ review, user }) {
        this.dispatch({ review, user });

        fetch('/api/review/approve', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ review, user })
        });
    }
}

export default alt.createActions(ReviewActions);
