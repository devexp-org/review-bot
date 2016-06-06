export default function mock() {

  return {
    choose: sinon.stub().returns(Promise.resolve())
  };

}

export function reviewMembersMock() {
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
