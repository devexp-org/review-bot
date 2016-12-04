export default function mock(mockDriverFrontEnd, teamName) {

  return {
    findTeamByPullRequest: sinon.stub()
      .returns(Promise.resolve(mockDriverFrontEnd))
  };

}
