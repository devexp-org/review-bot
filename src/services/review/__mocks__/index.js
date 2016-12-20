export default function mock() {

  return {
    choose: sinon.stub().returns(Promise.resolve())
  };

}

export function memberMock() {
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

export function reviewMock() {
  return [
    { login: 'Black Widow', rank: 10 },
    { login: 'Captain America', rank: 5 },
    { login: 'Hawkeye', rank: 3 },
    { login: 'Hulk', rank: 8 },
    { login: 'Iron Man', rank: 7 },
    { login: 'Spider-Man', rank: 6 },
    { login: 'Thor', rank: 3 }
  ];
}
