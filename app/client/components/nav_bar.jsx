import React from 'react';
import { Link } from 'react-router';

export default class NavBar extends React.Component {
    render() {
        return (
            <nav className='navbar navbar-default' role='navigation'>
                <div className='container'>
                    <div className='navbar-header'>
                        <Link className='navbar-brand' to='/'>Review Tool</Link>
                    </div>
                    <div className='collapse navbar-collapse'>
                        <ul className='nav navbar-nav'>
                            <li className='active'><Link to='/'>Pull requests</Link></li>
                            <li><a href='#'>Review</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
