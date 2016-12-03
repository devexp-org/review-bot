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
    comments: Number,
    review_comments: Number,
    commits: Number,
    additions: Number,
    deletions: Number,
    changed_files: Number,
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
   * Returns repo owner.
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
   * Finds pull requests by user.
   *
   * @param {String} login
   *
   * @return {Promise.<PullRequest>}
   */
  model.statics.findByUser = function (login) {
    return this
      .model(modelName)
      .find({ 'user.login': login })
      .sort('-updated_at')
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
