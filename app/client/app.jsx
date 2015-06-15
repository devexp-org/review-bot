import React from 'react';
import Router from 'react-router';

import NavBar from 'app/client/components/nav_bar.jsx';

var RouteHandler = Router.RouteHandler;

export default class App extends React.Component {
    render() {
        return (
            <div>
                <NavBar/>
                <div className='container'>
                    <RouteHandler/>
                </div>
            </div>
        );
    }
}
