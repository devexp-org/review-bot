import ReviewBadgeBuilder from '../class';

describe('services/badges-review/class', function () {

  let url, builder, review;

  beforeEach(function () {
    url = 'https://www.example.com/';

    review = {
      status: 'notstarted',
      reviewers: [
        { login: 'foo', html_url: 'https://people.com/foo', approved: true },
        { login: 'bar', html_url: 'https://people.com/bar' }
      ]
    };

    builder = new ReviewBadgeBuilder(url);
  });

  it('should build review badges', function () {
    const result = builder.build(review);
    const expected =
      '<img src="https://www.example.com/review-not_started-lightgrey.svg" />' + ' ' +
      '<a href="https://people.com/foo"><img src="https://www.example.com/foo-ok-green.svg" /></a>' + ' ' +
      '<a href="https://people.com/bar"><img src="https://www.example.com/bar-...-yellow.svg" /></a>';

    assert.equal(result, expected);
  });

  describe('#statusToColor', function () {

    it('should map status to color', function () {
      assert.equal(builder.statusToColor('changesneeded'), 'yellow');
      assert.equal(builder.statusToColor('inprogress'), 'yellow');
      assert.equal(builder.statusToColor('notstarted'), 'lightgrey');
      assert.equal(builder.statusToColor('complete'), 'green');
    });

  });

  describe('#statusToTitle', function () {

    it('should map status to title', function () {
      assert.equal(builder.statusToTitle('changesneeded'), 'changes needed');
      assert.equal(builder.statusToTitle('inprogress'), 'in progress');
      assert.equal(builder.statusToTitle('notstarted'), 'not started');
      assert.equal(builder.statusToTitle('complete'), 'complete');
    });

  });

});
