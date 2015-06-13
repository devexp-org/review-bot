import GitHub from 'github';

var api;

export function init(options) {
    api = new GitHub(options);
}

export default api;
