import YandexStaffUser from './class';

/**
 * Creates "Invater" service.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {Invater}
 */
export default function setup(options, imports) {

  const staff = imports['yandex-staff'];

  return new YandexStaffUser(staff);

}
