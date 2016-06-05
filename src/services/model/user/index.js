import { Schema } from 'mongoose';

const Contact = new Schema({
  id: {
    type: String,
    'enum': ['mail', 'jabber']
  },
  account: String
});

export function setupSchema() {
  return {
    _id: String,
    contacts: {
      type: [Contact],
      'default': []
    }
  };
}

export function setupModel(modelName, model) {

  /**
   * Set mongo id the same as user login
   */
  model.virtual('login')
    .get(function () { return this._id; })
    .set(function (login) { this._id = login; });

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
      .findById(login);
  };

  model.methods.getContacts = function () {
    return this.contacts || [];
  };

}
