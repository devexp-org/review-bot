import style from './avatar.scss'; // eslint-disable-line
import React from 'react';

export default class Avatar {
    static propTypes = {
        img: React.PropTypes.string.isRequired,
        url: React.PropTypes.string
    };

    render() {
        var img = (<img src={ this.props.img }/>);

        if (this.props.url) {
            return (
                <a className='avatar' href={ this.props.url }>{ img }</a>
            );
        }

        return (
            <div className='avatar'>{ img }</div>
        );
    }
}
