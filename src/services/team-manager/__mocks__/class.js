export default function mock(mockDriver, teamName) {

  return {
    findTeamByPullRequest: sinon.stub()
      .returns(Promise.resolve(mockDriver))
  };

}
