import fetch from 'whatwg-fetch';

import React from 'react';
import Router from 'react-router';

import alt from 'app/client/alt';
import App from 'app/client/app.jsx';

import IndexPage from 'app/client/pages/index.jsx';
import ReviewPage from 'app/client/pages/review.jsx';

alt.dispatcher.register(console.log.bind(console));

var Route = Router.Route,
    routes;

routes = (
    <Route handler={ App }>
        <Route handler={ IndexPage } path='/'/>
        <Route handler={ ReviewPage } path='/review/:id'/>
    </Route>
);

Router.run(routes, Router.HistoryLocation, (Root) => {
    React.render(<Root/>, document.getElementById('devexp-react-app'));
});
