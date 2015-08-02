import path from 'path';
import express from 'express';
import proxy from 'proxy-express';
import bodyParser from 'body-parser';
import responseTime from 'response-time';

import logger from 'app/modules/logger';
import config from 'config';

// Import middlewere and routes
import response from 'app/modules/response';
import badgeRoute from 'app/modules/badges/route';
import githubRoutes from 'app/modules/github/routes';
import reviewRoutes from 'app/modules/review/routes';

// Import modules
import * as modules from 'app/modules'; // eslint-disable-line no-unused-vars

const app = express();
const serverConfig = config.get('server');

/**
 * Setup server
 */
if (process.env.WEBPACK_DEV) {
    app.use(proxy('localhost:' + (process.env.WEBPACK_DEV_PORT || 8080) + '/public/app.js', '/public/app.js'));
}

app.use(responseTime());
app.use(bodyParser.json());
app.use(serverConfig.staticBase, express.static(serverConfig.staticPath));

/**
 * Routes / Middlewares
 */
app.use(response());

app.use('/badges', badgeRoute(config.get('badges')));
app.use('/api/github', githubRoutes);
app.use('/api/review', reviewRoutes);

/**
 * Default Routes
 * Should always be last
 */
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'layout.html'));
});

app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
    logger.error(err);
    res.error(err.stack);
});

export default app;
