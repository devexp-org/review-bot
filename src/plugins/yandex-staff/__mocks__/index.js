export default function mock() {

  return {
    getUsers: sinon.stub(),
    apiAbsence: sinon.stub(),
    apiUserInfo: sinon.stub(),
    getUsersInOffice: sinon.stub(),
    isAbsence: sinon.stub().returns(true),
    _addAvatarAndUrl: sinon.stub()
  };

}
