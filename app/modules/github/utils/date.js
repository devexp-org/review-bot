import moment from 'moment';

/**
 * Returns since date for github api.
 *
 * @param {String[]} date - [2, 'days']
 * @returns {String} [description]
 */
export function getSinceDate(date) {
    if (!date) return '';

    return moment()
        .subtract(date[0], date[1] || 'days')
        .format('YYYY-MM-DDTHH:MM:SSZ');
}
