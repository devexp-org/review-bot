import { YandexStaffDriverFactory } from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const staff = imports['yandex-staff'];

  return new YandexStaffDriverFactory(staff, model('team'), model('user'));

}
