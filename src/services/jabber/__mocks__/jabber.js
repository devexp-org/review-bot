export default function jabberStub() {

  const jabber = sinon.stub();

  jabber.prototype.send = jabber.send = sinon.stub();
  jabber.prototype.close = jabber.close = sinon.stub();
  jabber.prototype.connect = jabber.connect = sinon.stub();

  return jabber;

}
