import TeamSync from './class';
import schedule from 'node-schedule';

export default function setup(options, imports) {

  const model = imports.model;
  const UserModel = model('user');
  const TeamModel = model('team');
  const teamManager = imports['team-manager'];

  const teamSync = new TeamSync(UserModel, TeamModel, teamManager);

  return new Promise((resolve) => {

    const date = '0 0 2 * * *'; // every day at 02:00:00 am
    const sync = schedule.scheduleJob('team-sync', date, () => {
      return teamManager.getTeams()
        .then(teams => {
          const promise = teams.map(team => {
            return teamSync.syncTeam(team.name);
          });
          return Promise.all(promise);
        });
    });

    teamSync.shutdown = () => sync.cancel();

    resolve(teamSync);

  });

}
