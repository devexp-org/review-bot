export default function xmppStub() {

  const xmpp = sinon.stub();

  xmpp.prototype.on = xmpp.on = sinon.stub();

  xmpp.prototype.end = xmpp.end = sinon.stub();

  xmpp.prototype.send = xmpp.send = sinon.stub();

  xmpp.prototype.connect = xmpp.connect = sinon.stub();

  xmpp.prototype.addListener = xmpp.addListener = sinon.stub();

  xmpp.on.withArgs('connect').callsArg(1);

  return xmpp;

}
