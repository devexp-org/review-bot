module.exports = function (github) {
    return function processPullRequest(body) {
        console.log(github);
        console.log('pull request webhook processor');
    };
};
