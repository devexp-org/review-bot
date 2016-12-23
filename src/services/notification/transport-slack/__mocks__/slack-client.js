export default function slackClientStub() {

  const slackClient = sinon.stub();

  const directMessage = {
    id: 'directmessage_id'
  };

  const dataStore = {
    getDMById: sinon.stub()
      .returns(directMessage),

    getDMByName: sinon.stub()
      .returns(directMessage),

    getUserByEmail: sinon.stub()
      .returns({ id: 'user_id' })
  };

  slackClient.prototype.on = slackClient.on = sinon.stub();
  slackClient.prototype.start = slackClient.start = sinon.stub();
  slackClient.prototype.disconnect =
    slackClient.disconnect =
    sinon.stub();
  slackClient.prototype.sendMessage =
    slackClient.sendMessage =
    sinon.stub();

  slackClient.prototype.dataStore =
    slackClient.dataStore =
    dataStore;

  slackClient.on
    .withArgs('open')
    .callsArgAsync(1);

  slackClient.on
    .withArgs('ws_error')
    .callsArgAsync(1);

  slackClient.on
    .withArgs('authenticated')
    .callsArgWithAsync(1, {
      self: { name: 'self.name' },
      team: { name: 'team.name' }
    });

  slackClient.on
    .withArgs('disconnect')
    .callsArgAsync(1);

  return slackClient;

}
