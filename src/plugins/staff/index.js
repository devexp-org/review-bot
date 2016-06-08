import got from 'got';
import Staff from './class';

export default function setup(options) {

  return new Staff(got, options);

}
