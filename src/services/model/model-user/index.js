export function baseSchema() {
  return {
    login: {
      type: String,
      unique: true,
      required: true,
      minlength: 2,
      maxlength: 256
    },
    html_url: {
      type: String,
      maxlength: 1024
    },
    avatar_url: {
      type: String,
      maxlength: 1024
    },
    contacts: [{
      id: { type: String },
      account: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 1024
      }
    }]
  };
}

export function setupModel(modelName, model) {

  /**
   * Finds user by login
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  model.statics.findByLogin = function (login) {
    return this
      .model(modelName)
      .findOne({ login })
      .exec();
  };

  /**
   * Returns user contacts
   *
   * @return {Array}
   */
  model.methods.getContacts = function () {
    return this.contacts || [];
  };

}

export default function setup() {
  return { baseSchema, setupModel };
}

/**
 * @classdesc The class used to represent user.
 *
 * @name User
 * @class
 *
 * @extends MongooseModel
 *
 * @property {String} login
 * @property {String} html_url
 * @property {String} avatar_url
 * @property {Array} contacts
 */
