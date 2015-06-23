import React from 'react';

export default class Avatar {
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
