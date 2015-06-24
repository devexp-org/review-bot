import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';

export default class ReviewerBadge {
    render() {
        var reviewer = this.props.reviewer;

        if (!reviewer) return;

        return (
            <a  href='#'
                className='reviewer -badge'
                key={ reviewer.login }>
                    <div className='reviewer__remove glyphicon glyphicon-remove text-muted'
                        onClick={ this.props.onRemoveClick }>
                    </div>
                    <div className='reviewer__avatar'>
                        <Avatar img={ reviewer.avatar }/>
                    </div>
                    <div className='reviewer__username text-muted'>
                        { reviewer.login }
                    </div>
            </a>
        );
    }
}
