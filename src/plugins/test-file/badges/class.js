import BadgeBase from '../../../services/badges/base-badge';

export const TESTS_NOT_EXISTS = 0;
export const TESTS_EXISTS = 1;
export const TESTS_CHANGE = 2;

export default class TestBadgeBuilder extends BadgeBase {

  /**
   * Create badge content.
   *
   * @param {String} type
   * @param {Number} availability
   *
   * @return {String}
   */
  buildTestBadge(type, availability = TESTS_NOT_EXISTS) {
    const status = [
      { text: 'не хватает', color: 'lightgrey' },
      { text: 'не изменились', color: 'yellow' },
      { text: 'изменились', color: 'green' }
    ];

    return this.create(
      type,
      status[availability].text,
      status[availability].color
    );
  }

  /**
   * Create test badge with label.
   *
   * @param {String} body
   *
   * @return {String}
   */
  build(body) {
    return 'Тесты:\n' + body;
  }

}
