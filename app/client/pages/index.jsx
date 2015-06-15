import React from 'react';
import connectToStores from 'alt/utils/connectToStores';
import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestsActions from 'app/client/actions/pull_requests';
import PullRequestList from 'app/client/components/pull_request_list.jsx';

class IndexPage extends React.Component {
    static getStores() {
        return [PullRequestListStore];
    }

    static getPropsFromStores() {
        return PullRequestListStore.getState();
    }

    componentWillMount() {
        PullRequestsActions.load('d4rkr00t');
    }

    render() {
        var pullRequests = this.props.pullRequests || [];

        return (
            <PullRequestList items={ pullRequests }/>
        );
    }
}

export default connectToStores(IndexPage);
