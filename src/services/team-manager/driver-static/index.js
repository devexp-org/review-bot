import { StaticDriverFactory } from './class';

export default function setup(options, imports) {

  const model = imports.model;

  return new StaticDriverFactory(model('team'));

}
