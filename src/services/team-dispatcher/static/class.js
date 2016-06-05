import { cloneDeep } from 'lodash';
import AbstractTeam from '../team';

export default class StaticTeam extends AbstractTeam {

  /**
   * @constructor
   *
   * @param {Array.<Developer>} members - array of team members
   * @param {Object} options
   */
  constructor(members, options) {
    super(options);

    if (!Array.isArray(members)) {
      throw new Error('Members should be an array');
    }

    if (members.length === 0) {
      throw new Error('Passed an empty array of members');
    }

    this._members = members;
  }

  /**
   * @override
   */
  getMembersForReview() {
    return Promise.resolve(cloneDeep(this._members));
  }

}
