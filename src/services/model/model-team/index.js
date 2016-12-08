import { Schema } from 'mongoose';

export function baseSchema() {
  return {
    name: {
      type: String,
      unique: true,
      required: true,
      minlength: 2,
      maxlength: 256
    },
    members: [{
      ref: 'user',
      type: Schema.Types.ObjectId
    }],
    patterns: [String],
    reviewConfig: {
      steps: [{ name: String, options: Object }],
      approveCount: Number,
      totalReviewers: Number
    }
  };
}

export function setupModel(modelName, model) {

  /**
   * Find team by name
   *
   * @param {String} name
   *
   * @return {Promise.<Team>}
   */
  model.statics.findByName = function (name) {
    return this
      .model(modelName)
      .findOne({ name })
      .exec();
  };

  /**
   * Find team by name
   *
   * @param {String} name
   *
   * @return {Promise.<Team>}
   */
  model.statics.findByNameWithMembers = function (name) {
    return this
      .model(modelName)
      .findOne({ name })
      .populate('members')
      .exec();
  };

}

export default function setup() {
  return { baseSchema, setupModel };
}
