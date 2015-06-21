export default function reviewRandomReducer(max) {
    return function (review) {
        return new Promise(function (resolve) {
            review.team.forEach(function (member) {
                member.rank += Math.floor(Math.random() * (max - 1));
            });

            resolve(review);
        });
    };
}
