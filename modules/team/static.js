'use strict';

import _ from 'lodash';

export default class StaticTeam {

  /**
   * @constructor
   *
   * @param {Array<Developer>} members - array of team members
   */
  constructor(members) {
    if (!Array.isArray(members)) {
      throw new Error('Members should be an array');
    }
    if (members.length === 0) {
      throw new Error('Passed an empty array of members');
    }

    this.members = members;
  }

  getTeam() {
    const members = _.clone(this.members, true);
    return Promise.resolve(members);
  }

}
