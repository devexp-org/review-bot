import { YandexStaffDriverFactory } from './class';

export default function setup(options, imports) {

  const yandexStaff = imports['yandex-staff'];

  return new YandexStaffDriverFactory(yandexStaff);

}
