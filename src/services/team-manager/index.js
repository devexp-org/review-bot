import TeamManager from './class';

export default function setup(options, imports) {

  const model = imports.model;
  const search = imports.search;

  return new TeamManager(model('team'), search);

}
