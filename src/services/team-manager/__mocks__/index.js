import teamManagerMock from './class';
import { staticDriverMock } from '../driver-static/__mocks__/';

export function membersMock() {
  return [
    { login: 'Black Panther' },
    { login: 'Black Widow' },
    { login: 'Captain America' },
    { login: 'Captain Marvel' },
    { login: 'Falcon' },
    { login: 'Hank Pym' },
    { login: 'Hawkeye' },
    { login: 'Hulk' },
    { login: 'Iron Man' },
    { login: 'Luke Cage' },
    { login: 'Quicksilver' },
    { login: 'Scarlet Witch' },
    { login: 'Spider-Woman' },
    { login: 'Thor' },
    { login: 'Vision' },
    { login: 'Wasp' },
    { login: 'Wonder Man' }
  ];
}

export { staticDriverMock as teamMock };

export default function (teamName, member) {
  const driver = staticDriverMock();
  driver.findTeamMember.returns(Promise.resolve(member));

  return teamManagerMock(driver, teamName);
}
