import alt from 'client/alt';

class UserActions {
    constructor() {
        this.generateActions('loggedIn', 'logout', 'loggingFailed');
    }

    login() {
        this.actions.loggedIn({
            login: 'd4rkr00t',
            url: 'https://github.com/d4rkr00t'
        });
    }
}

export default alt.createActions(UserActions);
