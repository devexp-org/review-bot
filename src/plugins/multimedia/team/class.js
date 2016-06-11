import { assign, flatten, includes, cloneDeep } from 'lodash';
import StaffTeam from '../../staff-team/class';

export default class MMTeam extends StaffTeam {

  constructor(staff, groupId, teams) {
    super(staff, groupId);

    this.teams = teams;
  }

  getMembersForReview(pr) {
    const IMAGE_RE = /^IMAGESUI/;
    const VIDEO_RE = /^(VIDEOUI|MOBVIDEO)/;

    let prj;

    if (IMAGE_RE.test(pr.title)) {
      prj = 'image';
    }

    if (VIDEO_RE.test(pr.title)) {
      prj = 'video';
    }

    const groupId = prj ? this.teams[prj].groupId : this.groupId;

    return Promise.all(groupId.map(id => this.staff.getUsersInOffice(id)))
      .then(teams => {
        const resTeam = [];

        for (let i = 0; i < teams.length; i++) {
          const id = groupId[i];
          const team = teams[i];

          resTeam.push(team.map(user => this._updateTeamInfo(user, id)));
        }

        return cloneDeep(flatten(resTeam));
      });
  }

  _updateTeamInfo(user, groupId) {
    const mmTeam = includes(this.teams.image.groupId, groupId) ? 'image' : 'video';
    return assign(user, { groupId, mmTeam });
  }

}
