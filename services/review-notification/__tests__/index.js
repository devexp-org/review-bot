import service from '../../review-notification';

describe('service/review-notification', function () {

  let options, imports, payload;
  let notifyStartStub, notifyUpdateStub;

  beforeEach(function () {

    options = {
      transport: 'blackHole',
      events: {
        'review:started': './notify-start',
        'review:updated': './notify-update'
      }
    };

    imports = {
      events: {
        on: sinon.stub()
      },
      blackHole: sinon.stub(),
      requireDefault: sinon.stub()
    };

    payload = {
      pullRequest: {}
    };

    notifyStartStub = sinon.stub();
    notifyUpdateStub = sinon.stub();

    imports.events.on
      .withArgs('review:started').callsArgWithAsync(1, payload);

    imports.requireDefault
      .withArgs('./notify-start').returns(notifyStartStub);

    imports.requireDefault
      .withArgs('./notify-update').returns(notifyUpdateStub);

  });

  it('should subscribe notificators on events', function (done) {

    service(options, imports)
      .then(() => {

        assert.calledWith(imports.requireDefault, './notify-start');
        assert.calledWith(imports.requireDefault, './notify-update');

        assert.calledWith(imports.events.on, 'review:started');
        assert.calledWith(imports.events.on, 'review:updated');

        assert.calledWithExactly(
          notifyStartStub,
          imports.blackHole,
          payload
        );

        assert.notCalled(notifyUpdateStub);

        done();

      })
      .catch(done);

  });

});
