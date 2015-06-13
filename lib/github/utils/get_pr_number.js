import _ from 'lodash';

export default function getPrNumber(pullRequestUrl) {
    return parseInt(_.last(pullRequestUrl.split('/')));
}
