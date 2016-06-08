import got from 'got';
import StarTrack from './class';

export default function setup(options) {

  return new StarTrack(got, options);

}
