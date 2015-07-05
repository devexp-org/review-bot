import style from './not_found.scss'; // eslint-disable-line
import React from 'react';

export default class NotFound {
    static propTypes = {
        children: React.PropTypes.element
    };

    render() {
        if (!this.props.children) return null;

        return (
            <div className='panel panel-default not-found'>
                { this.props.children }
            </div>
        );
    }
}
