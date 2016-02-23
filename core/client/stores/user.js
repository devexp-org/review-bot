import alt from 'client/alt';

import UserActions from 'client/actions/user';

class UserStore {
    constructor() {
        this.state = {};

        this.bindListeners({
            onLoggedIn: UserActions.loggedIn,
            onLoggingFailes: UserActions.loggingFailed,
            onLogout: UserActions.logout
        });
    }

    onLoggedIn(user) {
        this.setState({ user });
    }

    onLogout() {
        this.setState({ user: null });
    }

    onLoggingFailes(err) {
        this.setState({ authenticationError: err });
    }
}

export default alt.createStore(UserStore, 'UserStore');
