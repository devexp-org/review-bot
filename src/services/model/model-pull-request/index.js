export function baseSchema() {
  return {
    id: {
      type: Number,
      unique: true,
      required: true
    },
    body: String,
    title: String,
    number: Number,
    html_url: String,
    state: {
      type: String,
      'enum': ['open', 'closed']
    },
    head: {
      ref: String,
      sha: String
    },
    base: {
      ref: String,
      sha: String
    },
    user: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    repository: {
      id: Number,
      name: String,
      html_url: String,
      full_name: String,
      owner: {
        id: Number,
        login: String,
        html_url: String,
        avatar_url: String
      }
    },
    created_at: Date,
    updated_at: Date,
    closed_at: Date,
    merged_at: Date,
    merged: Boolean,
    merged_by: {
      id: Number,
      login: String,
      html_url: String,
      avatar_url: String
    },
    commits: Number,
    comments: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
    review_comments: Number,
    files: {
      type: Array,
      'default': []
    }
  };
}

export function setupModel(modelName, model) {

  /**
   * Cast pull request to string.
   *
   * @return {String}
   */
  model.methods.toString = function () {
    return '[' + this.id + ' – ' + this.title + ']' + ' ' + this.html_url;
  };

  /**
   * Returns repository owner.
   *
   * @return {String}
   */
  model.virtual('owner').get(function () {
    if (this.repository &&
        this.repository.owner &&
        this.repository.owner.login) {
      return this.repository.owner.login;
    }

    return '';
  });

  /**
   * Finds pull requests by id.
   *
   * @param {String} id
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findById = function (id) {
    return this
      .model(modelName)
      .findOne({ id })
      .exec();
  };

  /**
   * Finds pull requests by user.
   *
   * @param {String} login
   * @param {Number} skip
   * @param {Number} limit
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByUser = function (login, skip = 0, limit = 50) {
    return this
      .model(modelName)
      .find({ 'user.login': login })
      .sort('-updated_at')
      .skip(skip)
      .limit(limit)
      .limit(50)
      .exec();
  };

  /**
   * Finds pull request by repository and number.
   *
   * @param {String} fullName - repository full name
   * @param {Number} number - pull request number
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByRepositoryAndNumber = function (fullName, number) {
    return this
      .model(modelName)
      .findOne({ number, 'repository.full_name': fullName })
      .exec();
  };

}

export default function setup() {
  return { baseSchema, setupModel };
}


/**
 * @classdesc The class used to represent pull request.
 *
 * @name PullRequest
 * @class
 *
 * @extends MongooseModel
 *
 * @property {Number} id
 * @property {String} body
 * @property {String} title
 * @property {Number} number
 * @property {String} html_url
 * @property {String} state
 * @property {Object} head
 * @property {Object} base
 * @property {Object} user
 * @property {Object} repository
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date} closed_at
 * @property {Date} merged_at
 * @property {Object} merged_by
 * @property {Number} commits
 * @property {Number} comments
 * @property {Number} additions
 * @property {Number} deletions
 * @property {Number} changed_files
 * @property {Number} review_comments
 * @property {Array} files
 */
