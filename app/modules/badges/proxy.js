import proxy from 'proxy-express';
import config from 'app/modules/config';

export default proxy(config.load('badges').host, '/badges');
