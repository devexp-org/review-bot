import YandexStaffSearch from './class';

export default function setup(options, imports) {

  const staff = imports['yandex-staff'];

  return new YandexStaffSearch(staff);

}
