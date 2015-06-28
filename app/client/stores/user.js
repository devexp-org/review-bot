import alt from 'app/client/alt';

class UserStore {
    constructor() {
        this.user = {
            login: 'd4rkr00t'
        };
    }
}

export default alt.createStore(UserStore, 'UserStore');
