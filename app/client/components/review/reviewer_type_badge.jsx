import React from 'react';

import Avatar from 'app/client/components/avatar/avatar.jsx';

export default class ReviewerBadge {
    static propTypes = {
        onRemoveClick: React.PropTypes.func,
        reviewer: React.PropTypes.object.isRequired
    };

    render() {
        var reviewer = this.props.reviewer,
            closeBtn;

        if (!reviewer) return;

        if (this.props.onRemoveClick) {
            closeBtn = (
                <div className='reviewer__remove glyphicon glyphicon-remove text-muted'
                    onClick={ this.props.onRemoveClick }>
                </div>
            );
        }

        return (
            <a className='reviewer -badge'
                href='#'
                key={ reviewer.login }>
                    { closeBtn }

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
