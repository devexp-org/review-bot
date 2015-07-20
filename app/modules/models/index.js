require('./models/pull_request');

var mongoose = require('mongoose');

/**
 * Returns model by name.
 *
 * @param {String} modelName - model name.
 *
 * @returns {Object} mongoose model.
 */
module.exports.get = function (modelName) {
    return mongoose.model(modelName);
};
