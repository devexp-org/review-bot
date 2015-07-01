import React from 'react';

export default class NotFound {
    static propTypes = {
        message: React.PropTypes.string
    };

    render() {
        if (!this.props.message) return null;

        return (
            <div className='panel panel-default not-found'>
                { this.props.message }
            </div>
        );
    }
}
