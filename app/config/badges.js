export default {
    url: 'https://img.shields.io/badge/',
    style: 'flat',
    types: {
        'review_status': require('app/core/review/badges/review_status')(),
        'reviewer': require('app/core/review/badges/reviewer')()
    }
};
