import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const search = imports['team-search'];

  return new TeamManager(model('team'), search);

}
