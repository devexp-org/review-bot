import React from 'react';
import Router from 'react-router';
import App from 'app/client/app.jsx';
import IndexPage from 'app/client/pages/index.jsx';

var Route = Router.Route,
    routes;

routes = (
    <Route handler={App}>
        <Route handler={IndexPage} path='/'/>
    </Route>
);

Router.run(routes, Router.HistoryLocation, (Root) => {
    React.render(<Root/>, document.getElementById('devexp-react-app'));
});
