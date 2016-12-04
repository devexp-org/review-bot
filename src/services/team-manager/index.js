import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const manager = new TeamManager({}, model('team'));

  return manager;
}
