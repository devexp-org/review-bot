export default {
    host: 'img.shields.io',
    url: '/badges/badge',
    style: 'flat',
    types: {
        'review_status': require('app/core/review/badges/review_status')(),
        'reviewer': require('app/core/review/badges/reviewer')()
    }
};
