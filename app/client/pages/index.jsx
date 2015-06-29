import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import UserStore from 'app/client/stores/user';

import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestsActions from 'app/client/actions/pull_requests';

import Loader from 'app/client/components/loader/loader.jsx';
import PullRequestList from 'app/client/components/pull_request_list.jsx';

@connectToStores
class IndexPage extends React.Component {
    static propTypes = {
        pullRequests: React.PropTypes.object
    };

    static getStores() {
        return [PullRequestListStore];
    }

    static getPropsFromStores() {
        return PullRequestListStore.getState();
    }

    componentWillMount() {
        var user = UserStore.getState().user;

        PullRequestsActions.loadUserPulls(user.login);
    }

    render() {
        var pullRequests = this.props.pullRequests;

        if (!pullRequests || this.props.loading) {
            return (
                <Loader active={ true } centered={ true }/>
            );
        }

        return (
            <PullRequestList items={ pullRequests }/>
        );
    }
}

export default IndexPage;
