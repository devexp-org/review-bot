import ReviewBadgeBuilder from '../class';

describe('services/badges/review-badges/class', function () {

  let url, builder, review;

  beforeEach(function () {
    url = 'http://www.example.com/';

    review = {
      status: 'notstarted',
      reviewers: [
        { login: 'foo', html_url: 'http://people.com/foo', approved: true },
        { login: 'bar', html_url: 'http://people.com/bar' }
      ]
    };

    builder = new ReviewBadgeBuilder(url);
  });

  it('should build review badges', function () {
    const result = builder.build(review);
    const expected =
      '<img src="http://www.example.com/review-not_started-lightgrey.svg" />' + ' ' +
      '<a href="http://people.com/foo"><img src="http://www.example.com/foo-ok-green.svg" /></a>' + ' ' +
      '<a href="http://people.com/bar"><img src="http://www.example.com/bar-...-yellow.svg" /></a>';

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
