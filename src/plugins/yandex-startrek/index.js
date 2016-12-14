import got from 'got';
import YandexStarTrack from './class';

export default function setup(options) {

  return new YandexStarTrack(got, options);

}
