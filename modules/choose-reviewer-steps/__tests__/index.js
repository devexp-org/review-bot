import stepsFactory from '../../choose-reviewer-steps';

describe('modules/choose-reviewer-steps', () => {
  const opts = {
    'team-github': {
      steps: [
        'step1',
        'step2'
      ]
    }
  };

  describe('getSteps', () => {
    let steps, team;
    beforeEach(() => {
      team = { getTeamName: sinon.stub().returns('team-github') };

      steps = stepsFactory(opts, { team });
    });

    it('should be rejected if team was not found', done => {
      team.getTeamName = sinon.stub().returns(null);

      steps({}).catch(() => done());
    });

    it('should be rejected if there aren`t any steps for team', done => {
      team.getTeamName = sinon.stub().returns('team');

      steps({}).catch(() => done());
    });

    it('should throw an error if there is no step with passed name', () => {
      steps = stepsFactory(opts, { team });

      assert.throws(() => {
        steps.getSteps({});
      });
    });

    it('should instantiate steps and resolve with steps array', done => {
      const step1 = function step1() {};
      const step2 = function step2() {};

      steps = stepsFactory(opts, { team, step1, step2 });

      steps({})
        .then(resolved => {
          assert.deepEqual(resolved, [step1, step2]);

          done();
        })
        .catch(done);
    });
  });
});
