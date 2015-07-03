import React from 'react';

import connectToStores from 'alt/utils/connectToStores';
import pageTitle from 'app/client/utils/page_title.jsx';
import authenticated from 'app/client/utils/authenticated.jsx';

import ReviewActions from 'app/client/actions/review';
import ReviewListStore from 'app/client/stores/review_list';
import UserStore from 'app/client/stores/user';

import Loader from 'app/client/components/loader/loader.jsx';
import NotFound from 'app/client/components/not_found/not_found.jsx';
import PullRequestList from 'app/client/components/pull_request_list.jsx';

@authenticated
@connectToStores
@pageTitle
export default class ReviewListPage {
    static propTypes = {
        isAuthenticated: React.PropTypes.func,
        loading: React.PropTypes.bool,
        notFound: React.PropTypes.bool,
        reviews: React.PropTypes.object
    };

    static getStores() {
        return [ReviewListStore];
    }

    static getPropsFromStores() {
        return ReviewListStore.getState();
    }

    static getPageTitle() {
        return 'Reviews list';
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

        if (!this.props.isAuthenticated()) {
            return (
                <NotFound>You should be authenticated</NotFound>
            );
        }

        if (this.props.notFound) {
            return (
                <NotFound>Reviews not found!</NotFound>
            );
        }

        return (
            <PullRequestList items={ reviews }/>
        );
    }
}
