export default function mock(team, teamName) {

  return {
    findTeamByPullRequest: sinon.stub().returns(team),
    findTeamNameByPullRequest: sinon.stub().returns(teamName)
  };

}
