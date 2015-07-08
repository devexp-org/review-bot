import proxy from 'proxy-express';
import * as config from 'app/core/config';

export default proxy(config.load('badges').host, '/badges');
