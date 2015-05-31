var Promise = require('es6-promise').Promise;

module.exports = function(team) {
    return new Promise(function(resolve) {
        resolve(team);
    });
};
