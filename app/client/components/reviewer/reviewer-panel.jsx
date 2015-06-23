import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';

export default class Reviewer {
    render() {
        var reviewer = this.props.reviewer;

        if (!reviewer) return null;

        return (
            <div className='reviewer'>
                <div className='panel panel-default '>
                    <div className='panel-body'>
                        <div className='reviewer__avatar'>
                            <Avatar img={ reviewer.avatar }/>
                        </div>
                        <h5 className='reviewer__username'>
                            { reviewer.login } <span className='label label-success'>{ reviewer.rank }</span>
                        </h5>
                        <div className='reviewer__actions'>
                            <button className='btn btn-default' onClick={ this.props.onClick }>Add to review</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
