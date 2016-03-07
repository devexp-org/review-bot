import React from 'react';

import UserStore from 'client/stores/user';
import UserActions from 'client/actions/user';

import Loader from 'client/components/loader/loader.jsx';

export default function (Component) {
    return class Authenticated extends React.Component {
        constructor() {
            super();

            this.state = {};
        }

        componentWillMount() {
            this.listener = UserStore.listen(this.onChange.bind(this));

            UserActions.login();
        }

        componentWillUnmount() {
            this.listener();
        }

        onChange() {
            console.log(UserStore.getState());

            this.setState({
                user: UserStore.getState().user
            });
        }

        isAuthenticated(user) {
            return user && user.login;
        }

        render() {
            if (!this.state.user) {
                return (
                    <Loader active={ true } centered={ true } />
                );
            }

            return (
                <Component {...this.props}
                    isAuthenticated={ this.isAuthenticated.bind(this, this.state.user) }
                    user={ this.state.user } />
            );
        }
    };
}
