import React from 'react';
import Router from 'react-router';

var RouteHandler = Router.RouteHandler;

export default class App extends React.Component {
    render() {
        return (
            <div>
                <div className='wrapper'>
                    <RouteHandler/>
                </div>
            </div>
        );
    }
}
