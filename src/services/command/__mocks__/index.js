export default function mock() {

  return {
    dispatch: sinon.stub.returns(Promise.resolve()),

    addCommand: sinon.stub()
  };

}

export function reviewersMock() {

  return [
    { login: 'Hulk' },
    { login: 'Thor' }
  ];

}
