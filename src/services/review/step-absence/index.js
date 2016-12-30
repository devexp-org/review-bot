import { map, remove, includes } from 'lodash';

import AbstractReviewStep from '../step';

export class AbsenceReviewStep extends AbstractReviewStep
{

  constructor(staff) {
    super();

    this.staff = staff;
  }

  /**
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {
    return new Promise(resolve => {
      const users = map(review.members, 'login');

      this.staff
        .apiAbsence(users)
        .then(absence => {
          const absentUsers = map(absence, 'staff__login');

          remove(review.members, (member) => {
            return includes(absentUsers, member.login);
          });

          return Promise.resolve(review);
        });
    });
  }

}


/**
 * Create review `absence` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {
  const yandexStaff = imports['yandex-staff'];

  return new AbsenceReviewStep(yandexStaff);
}
