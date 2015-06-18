export default function reviewSimpleTeamReducer() {
    return function (review) {
        return new Promise(function (resolve) {
            review.team = [
                { login: 'd4rkr00t', rank: 0 },
                { login: 'sbmaxx', rank: 0 },
                { login: 'mishanga', rank: 0 }
            ];

            resolve(review);
        });
    };
}
