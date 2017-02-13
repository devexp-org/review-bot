export default function mock(teamName) {

  return {
    getName: sinon.stub().returns(teamName || 'team-driver-1'),

    getOption: sinon.stub().returns(null),

    getCandidates: sinon.stub().returns(Promise.resolve([])),

    findTeamMember: sinon.stub().returns(Promise.resolve(null))

  };

}
