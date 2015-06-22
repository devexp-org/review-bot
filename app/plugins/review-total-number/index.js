export default function reviewTotalNumberReducer(max) {
    return function (review) {
        return new Promise(function (resolve) {
            review.team = review.team.slice(0, max);

            resolve(review);
        });
    };
}
