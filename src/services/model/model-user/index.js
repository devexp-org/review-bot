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
      id: { type: String, 'enum': ['email', 'jabber'] },
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
   * Find user by login
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  model.statics.findByLogin = function (login) {
    return this
      .model(modelName)
      .findOne({ login });
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
