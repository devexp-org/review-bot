import config from '../config/current.json';

export default (process.env.BROWSER ? window.__CONFIG__ : config);


