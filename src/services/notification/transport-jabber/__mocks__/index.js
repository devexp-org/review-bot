export default function mock() {

  const jabber = function () {};

  jabber.prototype.send = jabber.send = sinon.stub();
  jabber.prototype.close = jabber.close = sinon.stub();
  jabber.prototype.connect = jabber.connect = sinon.stub();

  return jabber;

}
