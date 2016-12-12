import YandexStaffTeam from './class';

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];

  return new YandexStaffTeam(staff, options.groupId, options.overrides);

}
