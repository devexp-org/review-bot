export default function () {
    return function (review) {
        return new Promise(function (resolve) {
            var pullAuthor = review.pull.user.login;

            review.team = review.team.filter(function (item) {
                return item.login !== pullAuthor;
            });

            resolve(review);
        });
    };
}
