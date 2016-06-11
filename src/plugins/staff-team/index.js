import StaffTeam from './class';

export default function setup(options, imports) {

  const staff = imports.staff;

  return new StaffTeam(staff, options.groupId, options.overrides);

}
