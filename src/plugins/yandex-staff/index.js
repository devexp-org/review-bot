import got from 'got';
import YandexStaff from './class';

export default function setup(options) {

  return new YandexStaff(got, options);

}
