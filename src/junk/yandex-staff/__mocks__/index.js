export default function mock() {

  return {
    getUsers: sinon.stub(),
    apiAbsence: sinon.stub(),
    apiUserInfo: sinon.stub(),
    getUsersInOffice: sinon.stub(),
    _addAvatarAndUrl: sinon.stub()
  };

}
