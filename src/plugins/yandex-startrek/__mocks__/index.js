export default function mock() {

  return {

    parseIssue: sinon.stub(),

    issueUpdate: sinon.stub().returns(Promise.resolve()),

    issueStatusChange: sinon.stub().returns(Promise.resolve())

  };

}
