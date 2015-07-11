require('./models/pull_request');

var mongoose = require('mongoose');

module.exports.get = function (modelName) {
    return mongoose.model(modelName);
};
