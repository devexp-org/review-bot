import React from 'react';
import { Route } from 'react-router';
import App from 'app/client/app.jsx';
import IndexPage from 'app/client/pages/index.jsx';

var route = React.createFactory(Route);

export default route({ handler: App },
    route({ name: 'index', path: '/', handler: IndexPage })
);
