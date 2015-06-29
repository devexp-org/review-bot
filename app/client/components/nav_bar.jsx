import React from 'react';

import { Link } from 'react-router';
import NavBarLink from 'app/client/components/nav_bar_link.jsx';

export default class NavBar extends React.Component {
    render() {
        return (
            <nav className='navbar navbar-inverse' role='navigation'>
                <div className='container'>
                    <div className='navbar-header'>
                        <Link className='navbar-brand' to='/'>Review Tool</Link>
                    </div>
                    <div className='collapse navbar-collapse'>
                        <ul className='nav navbar-nav'>
                            <NavBarLink to='/'>Pulls</NavBarLink>
                            <NavBarLink to='/reviews'>Reviews</NavBarLink>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
