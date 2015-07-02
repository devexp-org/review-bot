import React from 'react';

import connectToStores from 'alt/utils/connectToStores';
import pageTitle from 'app/client/utils/page_title.jsx';

import UserStore from 'app/client/stores/user';
import PullRequestListStore from 'app/client/stores/pull_request_list';
import PullRequestsActions from 'app/client/actions/pull_requests';

import Loader from 'app/client/components/loader/loader.jsx';
import NotFound from 'app/client/components/not_found/not_found.jsx';
import PullRequestList from 'app/client/components/pull_request_list.jsx';

@connectToStores
@pageTitle
class IndexPage extends React.Component {
    static propTypes = {
        loading: React.PropTypes.bool,
        notFound: React.PropTypes.bool,
        pullRequests: React.PropTypes.object
    };

    static getPageTitle() {
        return 'Pull request list';
    }

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

        if (this.props.notFound) {
            return (
                <NotFound message='Pull requests not found!' />
            );
        }

        return (
            <PullRequestList items={ pullRequests }/>
        );
    }
}

export default IndexPage;
