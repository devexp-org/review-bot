import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

class ReviewPage {
    static getStores() {
        return [PullRequestStore];
    }

    static getPropsFromStores() {
        return PullRequestStore.getState();
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
