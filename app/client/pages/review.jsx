import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestStore from 'app/client/stores/pull_request';
import PullRequestsActions from 'app/client/actions/pull_requests';

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

    render() {
        var pullRequest = this.props.pullRequest || {};

        if (!this.props.pullRequest) {
            return (
                <div>Pull request not found!</div>
            );
        }

        return (
            <div>Review of pull request: "{ pullRequest.title }"</div>
        );
    }
}

export default ReviewPage;
