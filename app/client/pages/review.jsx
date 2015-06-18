import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestStore from 'app/client/stores/pull_request';
import PullRequestsActions from 'app/client/actions/pull_requests';
import ReviewActions from 'app/client/actions/review';

@connectToStores
class ReviewPage {
    static getStores() {
        return [PullRequestStore];
    }

    static getPropsFromStores() {
        return PullRequestStore.getState();
    }

    componentWillMount() {
        PullRequestsActions.loadPull(this.props.params.id);
    }

    chooseReviewers() {
        ReviewActions.chooseReviewers(this.props.pullRequest.id);
    }

    render() {
        var pullRequest = this.props.pullRequest || {};

        if (!this.props.pullRequest) {
            return (
                <div>Pull request not found!</div>
            );
        }

        return (
            <div>
                <h4>Review of pull request: "{ pullRequest.title }"</h4>
                <button className='btn btn-primary' onClick={ this.chooseReviewers.bind(this) }>Choose reviewers</button>
            </div>
        );
    }
}

export default ReviewPage;
