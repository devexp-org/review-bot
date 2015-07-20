import mongoose from 'mongoose';
import * as pullRequestModel from './models/pull_request'; // eslint-disable-line no-unused-vars

/**
 * Returns model by name.
 *
 * @param {String} modelName - model name.
 *
 * @returns {Object} mongoose model.
 */
export function get(modelName) {
    return mongoose.model(modelName);
}
