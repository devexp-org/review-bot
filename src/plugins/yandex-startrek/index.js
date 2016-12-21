import got from 'got';
import YandexStarTrek from './class';

export default function setup(options) {

  return new YandexStarTrek(got, options);

}
