export default function mock() {

  const slack = function () {};

  slack.prototype.send = slack.send = sinon.stub();
  slack.prototype.close = slack.close = sinon.stub();
  slack.prototype.connect = slack.connect = sinon.stub();

  return slack;

}
