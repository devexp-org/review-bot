import { assign, includes, flatten, cloneDeep } from 'lodash';
import { StaticDriver, StaticDriverFactory } from '../driver-static/class';

export default class YandexMultimediaDriver extends StaticDriver {

  /**
   * @constructor
   *
   * @param {Team} team
   * @param {Object} driverConfig
   * @param {Object} staff - yandex staff module
   */
  constructor(team, driverConfig, staff) {
    super(team);

    if (!driverConfig.video || !driverConfig.images) {
      throw new Error('Required parameters "video" or "images" are not given');
    }

    this.staff = staff;
    this.video = [].concat(driverConfig.video);
    this.images = [].concat(driverConfig.images);
  }

  /**
   * @override
   */
  getCandidates(pullRequest) {
    const VIDEO_RE = /^(VIDEOUI|MOBVIDEO)/;
    const IMAGES_RE = /^IMAGESUI/;

    let team;

    if (VIDEO_RE.test(pullRequest.title)) {
      team = 'video';
    }

    if (IMAGES_RE.test(pullRequest.title)) {
      team = 'images';
    }

    const groupId = team ? this[team] : flatten([this.video, this.images]);

    const promise = groupId.map(this.staff.getUsersInOffice.bind(this.staff));

    return Promise.all(promise)
      .then(teams => {
        const members = [];

        for (let i = 0; i < teams.length; i++) {
          members.push(
            teams[i].map(user => this.setTeam(user, groupId[i]))
          );
        }

        return cloneDeep(flatten(members));
      });

  }

  /**
   * @override
   */
  findTeamMember(login) {
    return this.staff
      .apiUserInfo(login)
      .then(user => this.staff._addAvatarAndUrl(user));
  }

  /**
   * @protected
   *
   * @param {User} member
   * @param {Number} groupId
   *
   * @return {User}
   */
  setTeam(member, groupId) {
    const mmTeam = includes(this.images, groupId) ? 'images' : 'video';

    return assign(member, { mmTeam });
  }

}

export class YandexMultimediaDriverFactory extends StaticDriverFactory {

  constructor(staff) {
    super();

    this.staff = staff;
  }

  config() {
    return {
      video: {
        type: ['number']
      },
      images: {
        type: ['number']
      }
    };
  }

  makeDriver(team, driverConfig) {
    return new YandexMultimediaDriver(team, driverConfig, this.staff);
  }

}
