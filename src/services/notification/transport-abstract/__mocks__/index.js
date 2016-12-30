export default function mock() {

  const transport = function () {};

  transport.prototype.send = transport.send = sinon.stub().returns(Promise.resolve());
  transport.prototype.close = transport.close = sinon.stub().returns(Promise.resolve());
  transport.prototype.connect = transport.connect = sinon.stub().returns(Promise.resolve());

  return transport;

}
