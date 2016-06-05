import StaticTeam from './class';

export default function setup(options, imports) {

  return new StaticTeam(options.members, options.overrides);

}
