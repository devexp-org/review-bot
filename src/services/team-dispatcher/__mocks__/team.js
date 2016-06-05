export default function mock(member) {

  return {
    getOption: sinon.stub().returnsArg(1),

    findTeamMember: sinon.stub().returns(Promise.resolve(member)),

    getMembersForReview: sinon.stub().returns(Promise.resolve([]))
  };

}
