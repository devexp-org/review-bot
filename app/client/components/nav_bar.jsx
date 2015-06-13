import { Component } from 'react';
import { Link } from 'react-router';

export default class NavBar extends Component {
    render() {
        return (
            <nav className='navbar navbar-default' role='navigation'>
                <div className='container-fluid'>
                    <div className='wrapper'>
                        <div className='navbar-header'>
                            <Link className='navbar-brand' to='/'>Review Tool</Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
}
