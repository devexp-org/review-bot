import React from 'react';
import connectToStores from 'alt/utils/connectToStores';

import ReviewActions from 'app/client/actions/review';
import ReviewListStore from 'app/client/stores/review_list';
import UserStore from 'app/client/stores/user';

import Loader from 'app/client/components/loader/loader.jsx';
import PullRequestList from 'app/client/components/pull_request_list.jsx';

@connectToStores
export default class ReviewListPage {
    static propTypes = {
        reviews: React.PropTypes.object
    };

    static getStores() {
        return [ReviewListStore];
    }

    static getPropsFromStores() {
        return ReviewListStore.getState();
    }

    componentWillMount() {
        var user = UserStore.getState().user;

        ReviewActions.loadUserReviews(user.login);
    }

    render() {
        var reviews = this.props.reviews;

        if (!reviews || this.props.loading) {
            return (
                <Loader active={ true } centered={ true }/>
            );
        }

        return (
            <PullRequestList items={ reviews }/>
        );
    }
}
