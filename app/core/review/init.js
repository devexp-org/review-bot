import ranking from './ranking';
import listeners from './listeners';

export function init(options) {
    ranking.init(options);
    listeners.init(options);
}
