export default function mailerStub() {

  const mailer = sinon.stub();

  mailer.prototype.sendMail = mailer.sendMail = sinon.stub();
  mailer.prototype.createTransport = mailer.createTransport = sinon.stub();

  mailer.sendMail.callsArg(1);
  mailer.createTransport.returnsThis();

  return mailer;

}
